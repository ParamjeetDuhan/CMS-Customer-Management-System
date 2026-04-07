import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { isValidEmail } from '../../utils/helpers';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const validate = () => {
    if (!email)               { setError('Email is required');    return false; }
    if (!isValidEmail(email)) { setError('Enter a valid email');  return false; }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (sent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-scale-in text-center">

          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-3">Check your inbox</h1>
          <p className="text-brand-muted font-body text-sm leading-relaxed mb-2">
            We've sent a password reset link to
          </p>
          <p className="text-primary-400 font-body font-semibold text-sm mb-8">{email}</p>

          <div className="card p-6 text-left space-y-3 mb-6">
            <p className="text-xs text-brand-muted font-body">Didn't receive the email?</p>
            <ul className="text-xs text-brand-muted font-body space-y-1.5 list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>The link expires in <span className="text-white">30 minutes</span></li>
            </ul>
          </div>

          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-primary-400 hover:text-primary-300 font-body text-sm font-medium underline underline-offset-2 mb-4 block mx-auto"
          >
            Try a different email
          </button>

          <Link to="/login">
            <Button variant="secondary" fullWidth leftIcon={<HiArrowLeft className="w-4 h-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiMail className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-brand-muted font-body text-sm">
            Enter your registered email and we'll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              error={error}
              leftIcon={<HiMail className="w-4 h-4" />}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white font-body transition-colors"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;