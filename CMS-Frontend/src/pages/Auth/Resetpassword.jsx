import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { isValidPassword } from '../../utils/helpers';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token');

  const [form, setForm]       = useState({ newPassword: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [done,   setDone]     = useState(false);

  /* Redirect if no token in URL */
  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset link');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const validate = () => {
    const e = {};
    if (!isValidPassword(form.newPassword)) e.newPassword = 'Min 6 characters required';
    if (form.newPassword !== form.confirm)  e.confirm     = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, form.newPassword);
      setDone(true);
    } catch (err) {
      toast.error(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (done) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-scale-in text-center">

          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-3">Password reset!</h1>
          <p className="text-brand-muted font-body text-sm mb-8">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>

          <Link to="/login">
            <Button fullWidth size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Invalid token guard ── */
  if (!token) return null;

  /* ── Form state ── */
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiLockClosed className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-brand-muted font-body text-sm">
            Choose a strong password — at least 6 characters
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              name="newPassword"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPw((p) => !p)} className="cursor-pointer">
                  {showPw ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Input
              label="Confirm New Password"
              name="confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Reset Password
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <HiExclamationCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/80 font-body leading-relaxed">
              This reset link expires in <span className="font-semibold text-yellow-300">30 minutes</span>. If it has expired, request a new one from the forgot password page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;