import React from 'react';
import { Scan, Github, Linkedin, ShieldCheck, Mail, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Scan className="w-5 h-5" />
              </div>
              FaceAuth AI
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Next-generation biometric face recognition system engineered for zero-latency authentication, attendance tracking, and enterprise access control.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@faceauth.ai"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="Contact Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Core Features
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">AI Face Recognition</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Liveness Detection Engine</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Real-time Attendance Tracking</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">JWT Secure Auth</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Biometric Vector Database</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Technologies
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Computer Vision</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">128-D Face Embeddings</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">React & TypeScript</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Node.js Express Backend</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Tailwind Glassmorphism</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Security & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> AES-256 Vector Encryption</li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Compliance Documentation</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FaceAuth AI System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
