
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, Briefcase, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/profile', icon: Briefcase, label: 'Company Profile' },
        { to: '/products', icon: Package, label: 'Products' },
        { to: '/leads', icon: Users, label: 'Leads' },
    ];

    return (
        <div className="sidebar glass">
            <div className="mb-8" style={{ textAlign: 'center' }}>
                <img
                    src={theme === 'dark' ? '/images/Souq_Route_white_red.png' : '/images/souq-route-logo-black.png'}
                    alt="Souq Route"
                    style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: 'auto',
                        marginBottom: '8px'
                    }}
                />
                {/* <span className="text-sm text-muted" style={{ display: 'block' }}>Business Admin Panel</span> */}
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={toggleTheme}
                className="nav-item w-full text-left mb-2"
                style={{
                    transition: 'all 0.15s ease',
                }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
                onClick={handleSignOut}
                className="nav-item w-full text-left"
                style={{
                    transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e21323'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
                <LogOut size={20} />
                <span>Log Out</span>
            </button>
        </div>
    );
};

export default Sidebar;
