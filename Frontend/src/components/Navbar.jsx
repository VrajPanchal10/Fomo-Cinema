import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Menu, X, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // ── Desktop "More" dropdown state + ref ──────────────────────────────────
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // ── Desktop User Profile dropdown state + ref ─────────────────────────────
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // ── Central Auth state & triggers ──────────────────────────────────────────
  const { setOpenLogin, user, logout } = useAuth();

  // ── Logout confirmation modal state ────────────────────────────────────────
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ── Mobile hamburger drawer state ─────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Mobile "More" collapsible sub-menu state + ref ───────────────────────
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const drawerRef = useRef(null);   // wraps the entire mobile drawer

  // ── Helper to calculate user initials ──────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // ── Outside-click handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Desktop "More" dropdown
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
      // Desktop User Profile dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setOpenUserDropdown(false);
      }
      // Mobile drawer More sub-menu:
      if (
        mobileMoreOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        setMobileMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMoreOpen]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeMobile = () => {
    setMobileOpen(false);
    setMobileMoreOpen(false);
  };

  const handleMobileMoreLink = () => {
    setMobileMoreOpen(false);
    closeMobile();
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    addToast("Logged out successfully. See you soon! 👋", "success");
    navigate("/");
  };

  return (
    <>
      <nav className="bg-[#e5007d] text-white w-full block relative">
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto flex items-center justify-between h-17 px-4">
          {/* LOGO */}
          <div className="flex items-center justify-center">
            <Link to="/" onClick={closeMobile}>
              <img
                src={logo}
                alt="Fomo"
                className="h-12 sm:h-14 object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* ── DESKTOP NAV LINKS (md and above) ──────────────────────────── */}
          <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 text-base lg:text-lg font-medium">
            <Link to="/" className="hover:text-gray-200 transition">
              Home
            </Link>

            <Link to="/upcoming-shows" className="hover:text-gray-200 transition">
              Upcoming Shows
            </Link>

            <Link to="/food-drinks" className="hover:text-gray-200 transition">
              Food &amp; Drinks
            </Link>

            <Link to="/memberships" className="hover:text-gray-200 transition">
              Memberships
            </Link>

            <Link to="/offers" className="hover:text-gray-200 transition">
              Offers
            </Link>

            {user ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setOpenUserDropdown(!openUserDropdown)}
                  className="flex items-center gap-2 cursor-pointer focus:outline-none group py-1"
                >
                  <div className="w-9 h-9 rounded-full bg-white text-[#e5007d] font-bold flex items-center justify-center text-sm shadow hover:scale-105 transition transform duration-200">
                    {getInitials(user.name)}
                  </div>
                  <span className="max-w-[100px] truncate text-sm font-semibold group-hover:text-gray-200 transition">
                    {user.name.split(" ")[0]}
                  </span>
                  {openUserDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openUserDropdown && (
                  <div className="absolute right-0 mt-3 bg-zinc-950 border border-zinc-800 w-64 rounded-xl shadow-2xl py-3 z-50 animate-slide-down">
                    {/* User Profile Summary */}
                    <div className="px-4 py-2 border-b border-zinc-900 mb-2">
                      <p className="text-zinc-100 font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-zinc-400 text-xs truncate mt-0.5">{user.email}</p>
                    </div>
                    
                    {/* Links */}
                    {user && user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setOpenUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-900 text-sm text-zinc-300 hover:text-white transition"
                      >
                        <LayoutDashboard size={16} className="text-[#e5007d]" />
                        <span className="font-semibold text-white">Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/my-bookings"
                      onClick={() => setOpenUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-900 text-sm text-zinc-300 hover:text-white transition"
                    >
                      <Calendar size={16} className="text-[#e5007d]" />
                      <span>My Bookings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setOpenUserDropdown(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-900 text-sm text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      <LogOut size={16} className="text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setOpenLogin(true)}
                className="hover:text-gray-200 transition cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Desktop "More" dropdown */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="hover:text-gray-200 transition flex items-center gap-1 cursor-pointer"
              >
                <span>More</span>
                {openMenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {openMenu && (
                <div className="absolute top-10 left-0 bg-[#e5007d] w-60 rounded-lg shadow-xl py-3 z-50">
                  <Link
                    to="/about"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    About
                  </Link>
                  <Link
                    to="/faqs"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    FAQs
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/group-booking"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    Group Booking
                  </Link>
                  <Link
                    to="/terms"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    Terms &amp; Conditions
                  </Link>
                  <Link
                    to="/privacy"
                    onClick={() => setOpenMenu(false)}
                    className="block px-5 py-2 hover:bg-pink-700 transition"
                  >
                    Privacy Policy
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* HAMBURGER BUTTON (mobile / tablet) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-pink-700 transition cursor-pointer"
            onClick={() => {
              setMobileOpen((prev) => {
                if (prev) setMobileMoreOpen(false);
                return !prev;
              });
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* ── MOBILE DRAWER (md and below) ──────────────────────────────────── */}
        {mobileOpen && (
          <div
            ref={drawerRef}
            className="md:hidden bg-[#e5007d] border-t border-pink-600 px-4 py-4 flex flex-col gap-1 text-base font-medium z-40"
          >
            {/* Primary links */}
            <Link
              to="/"
              onClick={closeMobile}
              className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
            >
              Home
            </Link>
            <Link
              to="/upcoming-shows"
              onClick={closeMobile}
              className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
            >
              Upcoming Shows
            </Link>
            <Link
              to="/food-drinks"
              onClick={closeMobile}
              className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
            >
              Food &amp; Drinks
            </Link>
            <Link
              to="/memberships"
              onClick={closeMobile}
              className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
            >
              Memberships
            </Link>
            <Link
              to="/offers"
              onClick={closeMobile}
              className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
            >
              Offers
            </Link>

            {user ? (
              <div className="border-t border-b border-pink-400 my-2 py-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-3 px-2 py-1.5 mb-2 bg-pink-700/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-white text-[#e5007d] font-bold flex items-center justify-center text-sm shadow">
                    {getInitials(user.name)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-white leading-tight truncate">{user.name}</div>
                    <div className="text-xs text-pink-100 truncate mt-0.5">{user.email}</div>
                  </div>
                </div>

                {user && user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-pink-700 transition text-sm font-medium"
                  >
                    <LayoutDashboard size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                
                <Link
                  to="/my-bookings"
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-pink-700 transition text-sm font-medium"
                >
                  <Calendar size={18} />
                  <span>My Bookings</span>
                </Link>
                
                <button
                  onClick={() => {
                    closeMobile();
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-2 py-2 rounded hover:bg-pink-700 transition text-sm font-medium cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpenLogin(true);
                  closeMobile();
                }}
                className="text-left px-2 py-2.5 rounded hover:bg-pink-700 transition cursor-pointer"
              >
                Login
              </button>
            )}

            {/* ── Mobile "More" collapsible sub-menu ──────────────────────── */}
            <div className="border-t border-pink-400 mt-1 pt-1">
              <button
                onClick={() => setMobileMoreOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-2 py-2.5 rounded hover:bg-pink-700 transition cursor-pointer"
                aria-expanded={mobileMoreOpen}
                aria-controls="mobile-more-menu"
              >
                <span>More</span>
                {mobileMoreOpen
                  ? <ChevronUp size={18} className="shrink-0" />
                  : <ChevronDown size={18} className="shrink-0" />
                }
              </button>

              <div
                id="mobile-more-menu"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  mobileMoreOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-0.5 pt-1 pl-3">
                  <Link
                    to="/about"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    About
                  </Link>
                  <Link
                    to="/faqs"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    FAQs
                  </Link>
                  <Link
                    to="/contact"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/group-booking"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    Group Booking
                  </Link>
                  <Link
                    to="/terms"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    Terms &amp; Conditions
                  </Link>
                  <Link
                    to="/privacy"
                    onClick={handleMobileMoreLink}
                    className="block px-2 py-2.5 rounded hover:bg-pink-700 transition"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Logout</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to logout?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition text-zinc-300 hover:text-white font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg bg-[#e5007d] hover:bg-pink-700 transition text-white font-semibold cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
