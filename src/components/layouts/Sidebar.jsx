// components/layout/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaRobot, 
  FaTasks, 
  FaChartBar, 
  FaMap, 
  FaCog,
  FaBell,
  FaUser
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/bots', label: 'Bot Status', icon: <FaRobot /> },
    { path: '/tasks', label: 'Task Queue', icon: <FaTasks /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { path: '/map', label: 'Warehouse Map', icon: <FaMap /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 flex items-center">
                <FaRobot className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BotFlow</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-600 relative">
                <FaBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-600">
                <FaUser />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 z-40`}>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Stats</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Bots</span>
                <span className="font-bold">18</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending Tasks</span>
                <span className="font-bold">27</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">System Health</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarOpen ? 'pl-64' : 'pl-0'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-3">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                location.pathname === item.path ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;