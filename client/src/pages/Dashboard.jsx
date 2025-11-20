import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../assets/newlogo.svg";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { companyData, companyToken, setCompanyData, setCompanyToken } = useContext(AppContext);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!companyToken) navigate("/recruiter-login");
  }, [companyToken, navigate]);

  // Track active tab
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setActiveTab(path);
  }, [location]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if device is mobile and set initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Open sidebar on desktop, closed on mobile
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target) && 
            !event.target.closest(".menu-button")) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const formatTime = date => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const getGreeting = () => {
    const hour = currentTime.getHours();
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  };

  const logout = () => {
    setCompanyToken(null);
    localStorage.removeItem("companyToken");
    setCompanyData(null);
    navigate("/");
  };

  const navItems = [
    { path: "add-job", label: "Add Job", icon: "➕" },
    { path: "manage-job", label: "Manage Jobs", icon: "📂" },
    { path: "view-applications", label: "Applications", icon: "📨" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#f5f7fa] via-[#ebedfb] to-[#dce3ff] font-[Poppins] relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            id="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`bg-white/60 backdrop-blur-md z-50 flex flex-col justify-between border-r border-white/30 ${
              isMobile ? "fixed left-0 top-0 w-72 h-full" : "w-72 h-full"
            }`}
          >
            <div className="p-6">
              <img src={logo} alt="Logo" className="h-15 mb-8 cursor-pointer" onClick={() => navigate("/")} />
              <div className="space-y-3">
                {navItems.map(({ path, label, icon }, i) => (
                  <NavLink
                    key={i}
                    to={`/dashboard/${path}`}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] ${
                        isActive ? "bg-indigo-600 text-white" : "text-gray-800 hover:bg-white/20"
                      }`
                    }
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-5 rounded-bl-3xl">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-300 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {companyData?.name?.[0] || "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800">{companyData?.name}</p>
                  <p className="text-xs text-indigo-500">Recruiter Mode</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 text-sm text-red-500 hover:underline w-full text-left"
              >
                Sign out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-md shadow px-4 sm:px-8 py-5 flex justify-between items-center border-b border-white/20"
        >
          <div className="flex items-center">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="menu-button mr-4 p-2 rounded-md hover:bg-white/20 lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {activeTab.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-semibold">{getGreeting()},</p>
            <p className="text-xs text-gray-500">{companyData?.name}</p>
            <p className="text-sm text-gray-400">{formatTime(currentTime)}</p>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl p-4 sm:p-6 min-h-[500px]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;