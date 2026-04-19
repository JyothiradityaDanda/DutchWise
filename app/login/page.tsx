'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try { await signIn('google', { callbackUrl: '/' }); }
    catch { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 py-16 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))' }} />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-pink))' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <motion.div className="text-7xl mb-5 inline-block" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            💰
          </motion.div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">DutchWise</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Split expenses with friends</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="glass p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to track your expenses</p>
          </div>

          {/* Google button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Features */}
          <div className="pt-5 space-y-2.5" style={{ borderTop: '1px solid var(--glass-border)' }}>
            {['💸 Split expenses easily', '📊 Track balances in real-time', '👥 Manage multiple groups', '✨ Beautiful, smooth UI'].map((f, i) => (
              <motion.div key={f} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                {f}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
