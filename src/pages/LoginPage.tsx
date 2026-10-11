import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import type { ApiResponse, AuthResponse } from '../types/auth';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ identifier: '', password: '' });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/chat', { replace: true });
    return null;
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.identifier.trim()) errs.identifier = 'Username, email, or phone is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authApi.login({
        identifier: form.identifier.trim(),
        password: form.password,
      });

      if (result.success && result.data) {
        login(result.data.user, result.data.token, result.data.expiresAt);
        toast.success(`Welcome back, ${result.data.user.username}!`);
        navigate('/chat', { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const apiError = err.response.data as ApiResponse<AuthResponse>;
        toast.error(apiError.message || 'Invalid credentials');

        if (apiError.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, messages] of Object.entries(apiError.errors)) {
            fieldErrors[key.toLowerCase()] = (messages as string[])[0];
          }
          setErrors(fieldErrors);
        }
      } else {
        toast.error('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your conversations"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username, email, or phone"
          icon={<Mail size={18} />}
          placeholder="Enter your identifier"
          value={form.identifier}
          onChange={(e) => updateField('identifier', e.target.value)}
          error={errors.identifier}
          autoComplete="username"
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign In
          <ArrowRight size={16} />
        </Button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0c0b16] px-3 text-slate-500">New to FrenZo?</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors group"
          >
            Create an account
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
