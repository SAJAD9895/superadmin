
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { signIn } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
                <div className="mb-8 text-center">
                    <img
                        src={theme === 'dark' ? '/images/souq-route-logo.png' : '/images/souq-route-logo-black.png'}
                        alt="Souq Route"
                        style={{
                            width: '100%',
                            maxWidth: '240px',
                            height: 'auto',
                            margin: '0 auto 24px'
                        }}
                    />
                    <h2 className="h2 mb-2">Welcome Back</h2>
                    <p className="text-muted">Enter your credentials to access the admin panel.</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 rounded text-sm bg-red-900/20 text-red-200 border border-red-900/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                className="input"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                className="input"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-2"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
