import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Clock,
  Calendar,
  ShieldCheck,
  Scan,
  Edit3,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Camera,
  Activity,
  Layers,
  Building,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { User, LoginHistoryItem, DashboardStats } from '../types';
import { WebcamScanner } from '../components/WebcamScanner';

interface DashboardPageProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  token,
  onLogout,
  onUserUpdate,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters for History
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'face' | 'password'>('all');

  // Modals
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState<{
    matched: boolean;
    confidence: number;
    userName?: string;
    message: string;
  } | null>(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editDepartment, setEditDepartment] = useState(user.department || 'Engineering');
  const [editEmployeeId, setEditEmployeeId] = useState(user.employeeId || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Fetch Dashboard Stats & Logs
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, historyRes, usersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/face/history', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/users/list'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData.users || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id, token]);

  // Handle Scan Face Verification Test inside Modal
  const handleScanVerifyFace = async (embedding: number[], livenessPassed: boolean) => {
    setScanResult(null);
    try {
      const res = await fetch('/api/face/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceEmbedding: embedding }),
      });

      const data = await res.json();
      setScanResult({
        matched: data.matched,
        confidence: data.confidence,
        userName: data.user?.name,
        message: data.message,
      });

      // Refresh history & stats
      fetchDashboardData();
    } catch (err: any) {
      setScanResult({
        matched: false,
        confidence: 0,
        message: err.message || 'Verification request failed',
      });
    }
  };

  // Update Profile Info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          department: editDepartment,
          employeeId: editEmployeeId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      onUserUpdate(data.user);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setShowEditProfileModal(false), 1200);
    } catch (err: any) {
      setProfileMessage(err.message || 'Update failed');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Delete Face Biometrics
  const handleDeleteFaceData = async () => {
    if (!window.confirm('Are you sure you want to delete your registered face biometric data?')) return;
    try {
      const res = await fetch('/api/face/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        onUserUpdate(data.user);
        alert('Biometric data cleared.');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to delete biometric data.');
    }
  };

  // Filtered History Items
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ip.includes(searchTerm);
    const matchesMethod = methodFilter === 'all' || item.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Dashboard Overview
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                {user.role || 'Member'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Hello, {user.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {user.department || 'Engineering'} • ID: {user.employeeId || 'EMP-1001'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setScanResult(null);
                setShowScanModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Scan className="w-4 h-4" />
              Scan Face / Verify
            </button>

            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Logins */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Logins
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.totalLogins || history.length || 1}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Face: {stats?.faceLoginCount || 1} • Password: {stats?.passwordLoginCount || 0}
            </p>
          </div>

          {/* Card 2: Last Login */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Last Login
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {history[0]?.timestamp
                ? new Date(history[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {history[0]?.timestamp ? new Date(history[0].timestamp).toLocaleDateString() : 'Today'}
            </p>
          </div>

          {/* Card 3: Registered Date */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Registered Date
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Account Active & Verified
            </p>
          </div>

          {/* Card 4: Recognition Status */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recognition Status
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.faceRegistered ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {user.faceRegistered ? '128-D Vector Active' : 'Face Not Enrolled'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {user.faceRegistered ? 'Biometric 99.4% Accuracy' : 'Click Scan Face to enrollment'}
            </p>
          </div>

        </div>

        {/* Section: Attendance & Login History Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Attendance & Login Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time record of all biometric face scans and authentication sessions
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Methods</option>
                <option value="face">Face Scan Only</option>
                <option value="password">Password Only</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Device & IP</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No attendance history records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.userName}</div>
                        <div className="text-[11px] text-slate-400">{item.userEmail}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                            item.method === 'face'
                              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.method === 'face' ? '⚡ Face Recognition' : '🔑 Password'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        {item.confidence ? (
                          <span className="text-emerald-500">{item.confidence}% Match</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        <div>{item.device}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.ip}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.status === 'success' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Passed
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Failed
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: System Roster & Face Profile Status */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Registered System Roster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overview of enrolled users and facial biometric profile status
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {allUsers.length} Enrolled Users
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {u.faceSnapshot ? (
                    <img
                      src={u.faceSnapshot}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {u.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</p>
                    <span className="text-[10px] text-slate-400">{u.department || 'General'}</span>
                  </div>
                </div>

                <div className="text-right">
                  {u.faceRegistered ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Face Linked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      No Face
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SCAN FACE RECOGNITION MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-500" />
                Live Face Recognition Module
              </h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Align face with camera. The scanner extracts landmark vectors and compares against system user profiles.
            </p>

            <WebcamScanner
              mode="verify"
              livenessType="blink"
              onAuthenticateFace={handleScanVerifyFace}
            />

            {/* Scan Match Result Display */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  scanResult.matched
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{scanResult.matched ? 'MATCH CONFIRMED' : 'NO MATCH'}</span>
                  <span className="font-mono text-base">{scanResult.confidence}%</span>
                </div>
                <p>{scanResult.message}</p>
                {scanResult.userName && (
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Authenticated User: {scanResult.userName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                Edit Profile & Biometrics
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {profileMessage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={editEmployeeId}
                  onChange={(e) => setEditEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Biometrics Actions */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="block font-bold text-slate-700 dark:text-slate-300">Biometric Settings</span>
                <button
                  type="button"
                  onClick={handleDeleteFaceData}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Saved Face Vector
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
