
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [count, setCount] = useState(10);

    /* Auto-redirect countdown */
    useEffect(() => {
        if (count <= 0) { navigate('/'); return; }
        const t = setTimeout(() => setCount(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [count, navigate]);

    const logo = theme === 'dark'
        ? '/images/Souq_Route_white_red.png'
        : '/images/souq-route-logo-black.png';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-main)',
            textAlign: 'center',
        }}>
            {/* Logo */}
            <img
                src={logo}
                alt="Souq Route"
                style={{ width: 140, height: 'auto', marginBottom: '2.5rem', opacity: 0.85 }}
            />

            {/* 404 number */}
            <div style={{
                fontSize: 'clamp(80px, 20vw, 140px)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-4px',
                background: 'linear-gradient(135deg, var(--primary) 0%, rgba(var(--primary-rgb, 232,184,109),0.3) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1rem',
                userSelect: 'none',
            }}>
                404
            </div>

            <h1 style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '0.75rem',
            }}>
                Page Not Found
            </h1>

            <p className="text-muted" style={{
                maxWidth: 380,
                lineHeight: 1.7,
                marginBottom: '2rem',
                fontSize: '0.95rem',
            }}>
                The page you're looking for doesn't exist or has been moved.
                Don't worry — you'll be redirected to the dashboard in{' '}
                <strong style={{ color: 'var(--primary)' }}>{count}s</strong>.
            </p>

            {/* Progress bar */}
            <div style={{
                width: '100%',
                maxWidth: 300,
                height: 4,
                borderRadius: 4,
                background: 'var(--border)',
                marginBottom: '2rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    borderRadius: 4,
                    background: 'var(--primary)',
                    width: `${(count / 10) * 100}%`,
                    transition: 'width 1s linear',
                }} />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42 }}
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42 }}
                >
                    <Home size={16} /> Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFound;
