import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import type { ApiResponse, UserResponse } from '../types/auth';
import axios from 'axios';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  return { score: 5, label: 'Excellent', color: 'bg-emerald-400' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const strength = form.password ? getPasswordStrength(form.password) : null;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const username = form.username.trim();
    const email = form.email.trim();
    const phone = form.phoneNumber.trim();

    if (!username) errs.username = 'Username is required';
    else if (username.length < 3) errs.username = 'At least 3 characters';
    else if (username.length > 50) errs.username = 'Maximum 50 characters';

    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';

    if (!phone) errs.phoneNumber = 'Phone number is required';
    else if (!/^\+?[0-9\s-]{7,20}$/.test(phone)) errs.phoneNumber = 'Enter a valid phone number';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    else if (form.password.length > 100) errs.password = 'Maximum 100 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authApi.signup({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });

      if (result.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const apiError = err.response.data as ApiResponse<UserResponse>;
        toast.error(apiError.message || 'Signup failed');

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
      title="Create your account"
      subtitle="Join FrenZo and start connecting with people"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          icon={<User size={18} />}
          placeholder="Choose a unique username"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
          error={errors.username}
          autoComplete="username"
          autoFocus
        />

        <Input
          label="Email address"
          type="email"
          icon={<Mail size={18} />}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Phone number"
          type="tel"
          icon={<Phone size={18} />}
          placeholder="+91 98765 43210"
          value={form.phoneNumber}
          onChange={(e) => updateField('phoneNumber', e.target.value)}
          error={errors.phoneNumber}
          autoComplete="tel"
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          {/* Password strength meter */}
          {strength && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-1 pt-1"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${strength.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.score / 5) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  strength.score <= 1 ? 'text-rose-400' :
                  strength.score <= 2 ? 'text-amber-400' :
                  strength.score <= 3 ? 'text-yellow-400' :
                  'text-emerald-400'
                }`}>
                  {strength.label}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <Check size={16} />}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0c0b16] px-3 text-slate-500">Already have an account?</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign In
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
