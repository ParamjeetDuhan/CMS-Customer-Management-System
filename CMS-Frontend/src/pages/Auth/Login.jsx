import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
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
      await login({ email: form.email, password: form.password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiLockClosed className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-brand-muted font-body text-sm">Sign in to continue shopping locally</p>
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
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<HiMail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPw((p) => !p)} className="cursor-pointer">
                  {showPw ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-primary-500" />
                <span className="font-body">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 font-body font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-brand-card px-3 text-xs text-brand-muted font-body">
                New to ShopNear?
              </span>
            </div>
          </div>

          <Link to="/signup">
            <Button variant="secondary" fullWidth>
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
