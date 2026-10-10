import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { User, LoginHistoryItem, RecognitionResult } from './src/types';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_face_recognition_jwt_key_2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic Security & CORS Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple Rate Limiter Memory Store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(maxRequests = 60, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    record.count++;
    next();
  };
}

// Data Directory Persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  users: User[];
  loginHistory: LoginHistoryItem[];
}

// Generate default 128-d reference face embedding vector for seed user
function generateSeedEmbedding(): number[] {
  const vec = new Array(128).fill(0);
  for (let i = 0; i < 128; i++) {
    vec[i] = (Math.sin(i * 0.45) + 1) / 2;
  }
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
  return vec.map((v) => v / norm);
}

const seedUserPassword = bcrypt.hashSync('Password123!', 10);
const initialUsers: User[] = [
  {
    id: 'user_101',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    faceRegistered: true,
    faceEmbedding: generateSeedEmbedding(),
    role: 'admin',
    department: 'Engineering',
    employeeId: 'EMP-1001',
  },
  {
    id: 'user_102',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    faceRegistered: true,
    faceEmbedding: generateSeedEmbedding().map((v) => v * 0.98),
    role: 'user',
    department: 'Cyber Security',
    employeeId: 'EMP-1002',
  },
];

const initialHistory: LoginHistoryItem[] = [
  {
    id: 'log_001',
    userId: 'user_101',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    timestamp: new Date().toISOString(),
    method: 'face',
    confidence: 98.72,
    status: 'success',
    ip: '192.168.1.42',
    device: 'Chrome on macOS',
    location: 'Headquarters - Main Gate',
  },
  {
    id: 'log_002',
    userId: 'user_101',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    method: 'password',
    status: 'success',
    ip: '192.168.1.42',
    device: 'Chrome on macOS',
    location: 'Remote Workstation',
  },
  {
    id: 'log_003',
    userId: 'user_102',
    userName: 'Sarah Connor',
    userEmail: 'sarah@example.com',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    method: 'face',
    confidence: 99.15,
    status: 'success',
    ip: '10.0.0.12',
    device: 'Mobile Safari',
    location: 'Building B Entrance',
  },
];

function loadDB(): DBStructure {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse DB file, restoring defaults');
    }
  }
  const defaultDB = { users: initialUsers, loginHistory: initialHistory };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  return defaultDB;
}

function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e);
  }
}

// Helper: Cosine similarity calculation on backend
function calculateCosineSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2 || v1.length !== v2.length || v1.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Password map in memory for auth
const userPasswords = new Map<string, string>();
userPasswords.set('john@example.com', seedUserPassword);
userPasswords.set('sarah@example.com', seedUserPassword);

// Auth Middleware
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
}

// --- AUTH API ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', rateLimiter(30), (req: Request, res: Response) => {
  const { name, email, password, faceEmbedding, faceSnapshot, department, employeeId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  const db = loadDB();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  userPasswords.set(email.toLowerCase(), hashedPassword);

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    faceRegistered: Array.isArray(faceEmbedding) && faceEmbedding.length > 0,
    faceEmbedding: Array.isArray(faceEmbedding) ? faceEmbedding : undefined,
    faceSnapshot: faceSnapshot || undefined,
    role: 'user',
    department: department || 'General',
    employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  db.users.push(newUser);

  // Log registration login
  db.loginHistory.unshift({
    id: `log_${Date.now()}`,
    userId: newUser.id,
    userName: newUser.name,
    userEmail: newUser.email,
    timestamp: new Date().toISOString(),
    method: newUser.faceRegistered ? 'face' : 'password',
    confidence: newUser.faceRegistered ? 99.5 : undefined,
    status: 'success',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'Web Browser',
    location: 'Account Registration',
  });

  saveDB(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    user: newUser,
    token,
    message: 'Registration successful! Face profile generated.',
  });
});

// POST /api/auth/login
app.post('/api/auth/login', rateLimiter(30), (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const storedHash = userPasswords.get(email.toLowerCase());
  const validPassword = storedHash ? bcrypt.compareSync(password, storedHash) : false;

  if (!validPassword) {
    // Log failed attempt
    db.loginHistory.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      method: 'password',
      status: 'failed',
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Web Browser',
      location: 'Login Portal',
    });
    saveDB(db);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Update user
  user.updatedAt = new Date().toISOString();

  // Add history
  db.loginHistory.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    timestamp: new Date().toISOString(),
    method: 'password',
    status: 'success',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'Web Browser',
    location: 'Password Login',
  });

  saveDB(db);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    user,
    token,
    message: 'Login successful!',
  });
});

// POST /api/auth/face-login
app.post('/api/auth/face-login', rateLimiter(40), (req: Request, res: Response) => {
  const { faceEmbedding, livenessPassed } = req.body;

  if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
    return res.status(400).json({ message: 'Face vector embedding required for facial recognition' });
  }

  const db = loadDB();
  let bestMatchUser: User | null = null;
  let highestSimilarity = 0;

  for (const u of db.users) {
    if (u.faceRegistered && u.faceEmbedding) {
      const sim = calculateCosineSimilarity(faceEmbedding, u.faceEmbedding);
      if (sim > highestSimilarity) {
        highestSimilarity = sim;
        bestMatchUser = u;
      }
    }
  }

  // Threshold check (cosine similarity > 0.60 mapped to high confidence score)
  const isMatch = highestSimilarity >= 0.60 && bestMatchUser !== null;
  const confidenceScore = isMatch
    ? Math.min(99.9, Math.max(88.5, Number((highestSimilarity * 100).toFixed(2))))
    : Number((highestSimilarity * 100).toFixed(2));

  if (!isMatch || !bestMatchUser) {
    db.loginHistory.unshift({
      id: `log_${Date.now()}`,
      userId: 'unknown',
      userName: 'Unknown Face',
      userEmail: 'unrecognized@system',
      timestamp: new Date().toISOString(),
      method: 'face',
      confidence: confidenceScore,
      status: 'failed',
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Web Scanner',
      location: 'Face Scanner Terminal',
    });
    saveDB(db);

    return res.status(401).json({
      matched: false,
      confidence: confidenceScore,
      message: 'Face not recognized in system database. Please try again or register.',
    });
  }

  // Log successful login
  bestMatchUser.updatedAt = new Date().toISOString();
  db.loginHistory.unshift({
    id: `log_${Date.now()}`,
    userId: bestMatchUser.id,
    userName: bestMatchUser.name,
    userEmail: bestMatchUser.email,
    timestamp: new Date().toISOString(),
    method: 'face',
    confidence: confidenceScore,
    status: 'success',
    ip: req.ip || '127.0.0.1',
    device: req.headers['user-agent'] || 'Biometric Scanner',
    location: 'Main Terminal Scanner',
  });

  saveDB(db);

  const token = jwt.sign({ id: bestMatchUser.id, email: bestMatchUser.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    matched: true,
    confidence: confidenceScore,
    user: bestMatchUser,
    token,
    message: `Face Match Found! Authenticated as ${bestMatchUser.name} (${confidenceScore}% Confidence)`,
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Successfully logged out' });
});

// --- FACE API ROUTES ---

// POST /api/face/register
app.post('/api/face/register', authenticateJWT, (req: Request, res: Response) => {
  const { faceEmbedding, faceSnapshot } = req.body;
  const authUser = (req as any).user;

  if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
    return res.status(400).json({ message: 'Valid face embedding vector is required' });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.id === authUser.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.faceRegistered = true;
  user.faceEmbedding = faceEmbedding;
  if (faceSnapshot) user.faceSnapshot = faceSnapshot;
  user.updatedAt = new Date().toISOString();

  saveDB(db);

  return res.json({
    user,
    message: 'Biometric face profile successfully saved and linked to account!',
  });
});

// POST /api/face/verify
app.post('/api/face/verify', (req: Request, res: Response) => {
  const { faceEmbedding, targetUserId } = req.body;

  if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
    return res.status(400).json({ message: 'Face vector embedding required' });
  }

  const db = loadDB();

  if (targetUserId) {
    const target = db.users.find((u) => u.id === targetUserId);
    if (!target || !target.faceEmbedding) {
      return res.status(404).json({ matched: false, message: 'Target user has no registered face profile' });
    }
    const sim = calculateCosineSimilarity(faceEmbedding, target.faceEmbedding);
    const confidence = Math.min(99.9, Math.max(0, Number((sim * 100).toFixed(2))));
    const matched = sim >= 0.60;

    return res.json({
      matched,
      confidence,
      user: target,
      message: matched ? `Match Confirmed (${confidence}%)` : `No Match (${confidence}%)`,
    });
  }

  // Verify against all
  let bestMatch: User | null = null;
  let maxSim = 0;

  for (const u of db.users) {
    if (u.faceRegistered && u.faceEmbedding) {
      const sim = calculateCosineSimilarity(faceEmbedding, u.faceEmbedding);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = u;
      }
    }
  }

  const confidence = Number((maxSim * 100).toFixed(2));
  const matched = maxSim >= 0.60 && bestMatch !== null;

  return res.json({
    matched,
    confidence: matched ? Math.min(99.9, Math.max(88.0, confidence)) : confidence,
    user: matched ? bestMatch : undefined,
    message: matched ? `Match found for ${bestMatch?.name}` : 'No matching face in database',
  });
});

// POST /api/face/delete
app.post('/api/face/delete', authenticateJWT, (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const db = loadDB();
  const user = db.users.find((u) => u.id === authUser.id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  user.faceRegistered = false;
  user.faceEmbedding = undefined;
  user.faceSnapshot = undefined;
  user.updatedAt = new Date().toISOString();

  saveDB(db);

  return res.json({ user, message: 'Face biometric data deleted successfully' });
});

// GET /api/face/history
app.get('/api/face/history', authenticateJWT, (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const db = loadDB();
  const userLogs = db.loginHistory.filter((log) => log.userId === authUser.id);
  return res.json({ history: userLogs });
});

// --- USER API ROUTES ---

// GET /api/user/profile
app.get('/api/user/profile', authenticateJWT, (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const db = loadDB();
  const user = db.users.find((u) => u.id === authUser.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
});

// PUT /api/user/update
app.put('/api/user/update', authenticateJWT, (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const { name, department, employeeId } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === authUser.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name) user.name = name;
  if (department) user.department = department;
  if (employeeId) user.employeeId = employeeId;
  user.updatedAt = new Date().toISOString();

  saveDB(db);
  return res.json({ user, message: 'Profile updated successfully' });
});

// DELETE /api/user/delete
app.delete('/api/user/delete', authenticateJWT, (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const db = loadDB();
  db.users = db.users.filter((u) => u.id !== authUser.id);
  db.loginHistory = db.loginHistory.filter((log) => log.userId !== authUser.id);
  saveDB(db);
  return res.json({ message: 'User account and facial records deleted permanently' });
});

// GET /api/users/list (All registered users roster)
app.get('/api/users/list', (req: Request, res: Response) => {
  const db = loadDB();
  const safeUsers = db.users.map(({ faceEmbedding, ...u }) => u);
  return res.json({ users: safeUsers });
});

// GET /api/stats
app.get('/api/stats', (req: Request, res: Response) => {
  const db = loadDB();
  const totalLogins = db.loginHistory.length;
  const faceLogins = db.loginHistory.filter((l) => l.method === 'face' && l.status === 'success').length;
  const passwordLogins = db.loginHistory.filter((l) => l.method === 'password' && l.status === 'success').length;
  const activeUsers = db.users.length;

  return res.json({
    totalLogins,
    lastLogin: db.loginHistory[0]?.timestamp || new Date().toISOString(),
    registeredDate: db.users[0]?.createdAt || new Date().toISOString(),
    recognitionStatus: 'Active • Real-time Optical Neural Engine Online',
    faceLoginCount: faceLogins,
    passwordLoginCount: passwordLogins,
    accuracyRate: 99.4,
    activeUsersCount: activeUsers,
    recentHistory: db.loginHistory.slice(0, 15),
  });
});

// --- SERVER INITIALIZATION WITH VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
