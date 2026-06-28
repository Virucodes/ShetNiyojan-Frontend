import { Sun, Moon, User, Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme-context";
import logoImage from "@/assets/logo.png";
import ProfilePanel from "@/components/dashboard/ProfilePanel";
import LanguageSelector from "./LanguageSelector";

const DashboardHeader = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowUserMenu(false);
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = (user?.fullname || "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-800 transition-colors">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center px-5 py-3.5">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="ShetNiyojan Logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">ShetNiyojan</h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">Smart Farming Dashboard</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            
            {/* Notification bell (placeholder) */}
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {isDark ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(u => !u)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-agrigreen flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                  {user?.fullname || "User"}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.fullname}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">+91 {user?.mobileno}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); setShowProfilePanel(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User size={15} className="text-agrigreen" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-800"
                  >
                    <LogOut size={15} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="ShetNiyojan Logo" className="h-7 w-auto" />
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">ShetNiyojan</h1>
            </div>

            <div className="flex items-center gap-1.5">
              <LanguageSelector />
              
              {/* Theme toggle (mobile) */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
              </button>

              {/* Profile avatar (mobile) */}
              <button
                onClick={() => setShowProfilePanel(true)}
                className="w-8 h-8 rounded-full bg-agrigreen flex items-center justify-center text-white text-xs font-bold"
              >
                {initials}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(p => !p)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 py-2">
                <div className="w-9 h-9 rounded-full bg-agrigreen flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user?.fullname}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">+91 {user?.mobileno}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowProfilePanel(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <User size={15} className="text-agrigreen" /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={15} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Panel */}
      <ProfilePanel isOpen={showProfilePanel} onClose={() => setShowProfilePanel(false)} />
    </>
  );
};

export default DashboardHeader;