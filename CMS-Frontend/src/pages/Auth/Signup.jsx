import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiPhone,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
} from "../../utils/helpers";
import toast from "react-hot-toast";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    usertype: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email";
    if (form.phone && !isValidPhone(form.phone))
      e.phone = "Enter valid 10-digit mobile";
    if (!isValidPassword(form.password))
      e.password = "Min 6 characters required";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.terms = "Please accept terms";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        usertype: form.usertype,
      });
      toast.success("Account created! Welcome to ShopNear 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiUser className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Create account
          </h1>
          <p className="text-brand-muted font-body text-sm">
            Join ShopNear and explore local shops
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<HiUser className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<HiMail className="w-4 h-4" />}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">
                User Type <span className="text-primary-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="usertype"
                  value={form.usertype}
                  onChange={handleChange}
                  className="w-full bg-brand-card/50 border border-brand-border rounded-lg px-4 py-2.5 text-white outline-none appearance-none focus:border-primary-500/50 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-gray-900">
                    Select Type
                  </option>
                  <option value="shop_owner" className="bg-gray-900">
                    Shop Owner
                  </option>
                  <option value="retail_customer" className="bg-gray-900">
                    Customer
                  </option>
                </select>

                {/* This adds the little dropdown arrow back since appearance-none removes it */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <Input
              label="Phone (optional)"
              name="phone"
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<HiPhone className="w-4 h-4" />}
              hint="For order updates via SMS"
            />
            <Input
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="cursor-pointer"
                >
                  {showPw ? (
                    <HiEyeOff className="w-4 h-4" />
                  ) : (
                    <HiEye className="w-4 h-4" />
                  )}
                </button>
              }
              required
            />
            <Input
              label="Confirm Password"
              name="confirm"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
              required
            />

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (errors.terms) setErrors((p) => ({ ...p, terms: "" }));
                  }}
                  className="mt-0.5 w-3.5 h-3.5 accent-primary-500 flex-shrink-0"
                />
                <span className="text-xs text-gray-400 font-body leading-relaxed">
                  I agree to ShopNear's{" "}
                  <a href="#" className="text-primary-400 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary-400 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-400 mt-1">⚠ {errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-brand-card px-3 text-xs text-brand-muted font-body">
                Already have an account?
              </span>
            </div>
          </div>

          <Link to="/login">
            <Button variant="secondary" fullWidth>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
