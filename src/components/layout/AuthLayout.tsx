import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Globe } from 'lucide-react';
import Logo from '../ui/Logo';

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Real-time messaging with instant delivery' },
  { icon: Shield, title: 'End-to-End Secure', desc: 'Your conversations stay private, always' },
  { icon: Users, title: 'Groups & Channels', desc: 'Create spaces for teams and communities' },
  { icon: Globe, title: 'Cross Platform', desc: 'Seamlessly chat across all your devices' },
];

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* === Animated nebula background === */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#06060f]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] animate-nebula-1" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/15 blur-[100px] animate-nebula-2" />
        <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[90px] animate-nebula-3" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* === Main card === */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] shadow-2xl backdrop-blur-xl"
      >
        {/* Left — Brand showcase (hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 border-r border-white/[0.06] bg-gradient-to-br from-violet-950/40 to-fuchsia-950/20">
          <div>
            <Logo size="lg" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 text-lg text-slate-400 max-w-sm leading-relaxed"
            >
              Where conversations come alive. Connect, share, and build
              meaningful relationships — all in one place.
            </motion.p>
          </div>

          <div className="space-y-4 mt-10">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3.5 group"
              >
                <div className="mt-0.5 p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] group-hover:border-violet-500/30 group-hover:bg-violet-500/10 transition-all duration-300">
                  <feat.icon size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{feat.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-xs text-slate-600 mt-8"
          >
            © {new Date().getFullYear()} FrenZo. Crafted with purpose.
          </motion.p>
        </div>

        {/* Right — Auth form */}
        <div className="flex flex-col justify-center p-8 sm:p-10 xl:p-12">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
