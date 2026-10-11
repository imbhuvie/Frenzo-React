import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizes = {
  sm: { icon: 20, text: 'text-xl', gap: 'gap-2', pad: 'p-2' },
  md: { icon: 26, text: 'text-2xl', gap: 'gap-2.5', pad: 'p-2.5' },
  lg: { icon: 34, text: 'text-4xl', gap: 'gap-3', pad: 'p-3.5' },
};

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizes[size];

  return (
    <motion.div
      className={`flex items-center ${s.gap}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`relative ${s.pad} rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/25`}>
        <MessageCircle size={s.icon} className="text-white" strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 blur-lg opacity-40" />
      </div>
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight`}>
          <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
            Fren
          </span>
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Zo
          </span>
        </span>
      )}
    </motion.div>
  );
}
