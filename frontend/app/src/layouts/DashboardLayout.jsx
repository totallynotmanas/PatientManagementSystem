import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, Home, Users, FileText, Settings, LogOut,
    Activity, Calendar, Shield, Upload, Search, Bell, ChevronDown,
    Beaker, Pill, FileBarChart
} from 'lucide-react';

const DashboardLayout = ({ role, userName = "User" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        // Add logout logic here
        navigate('/login');
    };

    const getNavItems = (role) => {
        const common = [
            { label: 'Overview', icon: Home, path: `/dashboard/${role}` },
        ];

        switch (role) {
            case 'doctor':
                return [
                    ...common,
                    { label: 'Patients', icon: Users, path: `/dashboard/${role}/patients` },
                    { label: 'Appointments', icon: Calendar, path: `/dashboard/${role}/appointments` },
                    { label: 'Lab Results', icon: Beaker, path: `/dashboard/${role}/labs` },
                    { label: 'Prescriptions', icon: Pill, path: `/dashboard/${role}/prescriptions` },
                    { label: 'Reports', icon: FileBarChart, path: `/dashboard/${role}/reports` },
                    { label: 'Profile', icon: Settings, path: `/dashboard/${role}/profile` },
                ];
            case 'parent':
                return [
                    ...common,
                    { label: 'Children', icon: Users, path: `/dashboard/${role}/children` },
                    { label: 'Appointments', icon: Calendar, path: `/dashboard/${role}/appointments` },
                ];
            case 'nurse':
                return [
                    ...common,
                    { label: 'Vitals', icon: Activity, path: `/dashboard/${role}/vitals` },
                    { label: 'Schedule', icon: Calendar, path: `/dashboard/${role}/schedule` },
                ];
            case 'lab':
                return [
                    ...common,
                    { label: 'Upload Results', icon: Upload, path: `/dashboard/${role}/upload` },
                    { label: 'Orders', icon: FileText, path: `/dashboard/${role}/orders` },
                ];
            case 'admin':
                return [
                    ...common,
                    { label: 'User Management', icon: Users, path: `/dashboard/${role}/users` },
                    { label: 'System Logs', icon: Shield, path: `/dashboard/${role}/logs` },
                ];
            default:
                return common;
        }
    };

    const navItems = getNavItems(role);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Header */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-deep rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">MediCare</h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-brand-light text-brand-deep shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-brand-medium' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t">
                        <div className="flex items-center mb-4 px-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {userName.charAt(0)}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{userName}</p>
                                <p className="text-xs text-gray-500 capitalize">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Desktop Topbar */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm z-10">
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="ml-3 text-lg font-semibold text-gray-800">MediCare</span>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden lg:flex items-center flex-1 max-w-xl ml-4">
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-medium focus:bg-white transition-all shadow-sm"
                                placeholder="Search patients, appointments, or reports..."
                            />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="hidden lg:flex items-center pl-4 border-l">
                            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-deep font-bold border border-brand-medium/20">
                                    {userName.charAt(0)}
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-700">{userName}</span>
                                <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
