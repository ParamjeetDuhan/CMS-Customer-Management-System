import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUserLocation } from "../../utils/helpers";
import {
  HiShoppingCart,
  HiUser,
  HiMenuAlt3,
  HiX,
  HiHome,
  HiLocationMarker,
  HiClipboardList,
  HiLogout,
  HiLogin,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-xl font-body font-medium text-sm transition-all duration-200 ${
        isActive
          ? "bg-primary-500/15 text-primary-400"
          : "text-gray-400 hover:text-white hover:bg-brand-card"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
    setDropOpen(false);
  };
const handleShopsClick = async () => {
  try {
    const loc = await getUserLocation(); // ✅ your helper

    // ✅ save in localStorage
    localStorage.setItem("lat", loc.lat);
    localStorage.setItem("lng", loc.lng);

    // ✅ navigate with params
    navigate(`/shops`);

  } catch (err) {
    // ❌ fallback
    const city = prompt("Enter your city (e.g. Delhi)");

    if (!city) return;

    localStorage.setItem("city", city);

    navigate(`/shops?city=${city}`);
  }
};
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-brand-bg/95 backdrop-blur-md border-b border-brand-border shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
              <span className="text-white font-display font-bold text-sm">
                AD
              </span>
            </div>
            <span className="font-display font-bold text-lg text-white group-hover:text-gradient transition-all">
              Aapki Dukaan
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem
              to="/"
              icon={<HiHome className="w-4 h-4" />}
              label="Home"
            />
            <NavItem
              to="#"
              onClick={(e) => {
                e.preventDefault(); 
                handleShopsClick();
              }}
              icon={<HiLocationMarker className="w-4 h-4" />}
              label="Shops"
            />
            {isAuthenticated && (
              <NavItem
                to="/orders"
                icon={<HiClipboardList className="w-4 h-4" />}
                label="Orders"
              />
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-brand-card transition-all"
            >
              <HiShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-glow">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen((p) => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-card transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
                    <span className="text-primary-400 text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-card animate-slide-down overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-brand-card hover:text-white transition-colors"
                    >
                      <HiUser className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-brand-card hover:text-white transition-colors"
                    >
                      <HiClipboardList className="w-4 h-4" /> My Orders
                    </Link>
                    <div className="border-t border-brand-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <HiLogout className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all shadow-glow"
              >
                <HiLogin className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-400 hover:text-white"
            >
              <HiShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-card transition-all"
            >
              {menuOpen ? (
                <HiX className="w-5 h-5" />
              ) : (
                <HiMenuAlt3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-border animate-slide-down">
          <div className="page-container py-4 space-y-1">
            <NavItem
              to="/"
              icon={<HiHome className="w-4 h-4" />}
              label="Home"
              onClick={() => setMenuOpen(false)}
            />
            <NavItem
              to="/shops"
              icon={<HiLocationMarker className="w-4 h-4" />}
              label="Shops"
              onClick={() => setMenuOpen(false)}
            />
            {isAuthenticated && (
              <>
                <NavItem
                  to="/orders"
                  icon={<HiClipboardList className="w-4 h-4" />}
                  label="Orders"
                  onClick={() => setMenuOpen(false)}
                />
                <NavItem
                  to="/profile"
                  icon={<HiUser className="w-4 h-4" />}
                  label="Profile"
                  onClick={() => setMenuOpen(false)}
                />
              </>
            )}
            <div className="border-t border-brand-border pt-3 mt-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
                >
                  <HiLogout className="w-4 h-4" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold w-full justify-center"
                >
                  <HiLogin className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
