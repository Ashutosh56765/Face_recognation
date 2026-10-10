export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  faceRegistered: boolean;
  faceEmbedding?: number[]; // 128-dimensional embedding vector
  faceSnapshot?: string; // Base64 data URL preview of registered face
  role?: 'admin' | 'user';
  department?: string;
  employeeId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface RecognitionResult {
  matched: boolean;
  confidence: number; // e.g. 98.72
  user?: User;
  message: string;
  livenessPassed?: boolean;
}

export interface LoginHistoryItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  method: 'face' | 'password';
  confidence?: number;
  status: 'success' | 'failed';
  ip: string;
  device: string;
  location?: string;
}

export interface FaceDetectionFrame {
  faceDetected: boolean;
  multipleFaces: boolean;
  bbox?: { x: number; y: number; width: number; height: number };
  landmarks?: { x: number; y: number }[];
  lightLevel: 'low' | 'good' | 'overexposed';
  distance: 'too_close' | 'too_far' | 'optimal';
  livenessState: {
    blinkDetected: boolean;
    movementDetected: boolean;
    prompt: string;
    progress: number; // 0 to 100
  };
  embedding?: number[];
  snapshot?: string;
}

export interface DashboardStats {
  totalLogins: number;
  lastLogin: string;
  registeredDate: string;
  recognitionStatus: string;
  faceLoginCount: number;
  passwordLoginCount: number;
  accuracyRate: number;
  activeUsersCount: number;
}
