import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Storing links in an array makes it easy to add or remove pages later
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shops", path: "/shops" },
    { name: "Cart 🛒", path: "/cart" },
    { name: "Orders", path: "/orders" },
    { name: "Profile", path: "/profile" },
  ];

  // Helper function for active link styling
  const navLinkClass = ({ isActive }) =>
    `transition duration-200 font-medium ${
      isActive
        ? "text-blue-600 border-b-2 border-blue-600 pb-1"
        : "text-gray-600 hover:text-blue-500"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Meri Dukaan
            </span>
            <span className="ml-1">✨</span>
          </h1>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.name} to={item.path} className={navLinkClass}>
              {item.name}
            </NavLink>
          ))}

          {/* Login Button */}
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-500 focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute w-full left-0 top-full">
          <div className="px-4 pt-2 pb-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close menu on click
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md font-medium transition duration-200 ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-500"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="mt-2 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full shadow-md font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;