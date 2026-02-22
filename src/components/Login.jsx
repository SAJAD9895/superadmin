
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/* ── small inline alert ── */
const Alert = ({ type, children }) => (
    <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        background: type === 'error'
            ? 'rgba(226,19,35,0.08)'
            : 'rgba(34,197,94,0.08)',
        border: `1px solid ${type === 'error' ? 'rgba(226,19,35,0.3)' : 'rgba(34,197,94,0.3)'}`,
        color: type === 'error' ? '#e21323' : '#22c55e',
    }}>
        {children}
    </div>
);

/* ══════════════════════════════════════════════════
   SIGN-IN FORM
══════════════════════════════════════════════════ */
const SignInForm = ({ onForgotPassword, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8 text-center">
                <img
                    src={theme === 'dark'
                        ? '/images/souq-route-logo.png'
                        : '/images/souq-route-logo-black.png'}
                    alt="Souq Route"
                    style={{ width: '100%', maxWidth: '200px', height: 'auto', margin: '0 auto 20px', display: 'block' }}
                />
                <h2 className="h2 mb-1">Welcome Back</h2>
                <p className="text-muted text-sm">Sign in to your admin panel</p>
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="input-group mb-0">
                    <label className="label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={17} style={{
                            position: 'absolute', left: 12, top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-muted)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type="email"
                            required
                            className="input"
                            style={{ paddingLeft: 40 }}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="input-group mb-0">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label className="label" style={{ margin: 0 }}>Password</label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--primary)', fontSize: '0.8rem',
                                fontWeight: 500, padding: 0,
                            }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={17} style={{
                            position: 'absolute', left: 12, top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-muted)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type={showPw ? 'text' : 'password'}
                            required
                            className="input"
                            style={{ paddingLeft: 40, paddingRight: 42 }}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            style={{
                                position: 'absolute', right: 10, top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted)', padding: '4px',
                                display: 'flex', alignItems: 'center',
                            }}
                            title={showPw ? 'Hide password' : 'Show password'}
                        >
                            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full mt-2"
                    style={{ height: 44 }}
                >
                    {loading
                        ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} />
                        : 'Sign In'}
                </button>
            </form>
        </>
    );
};

/* ══════════════════════════════════════════════════
   FORGOT PASSWORD FORM
══════════════════════════════════════════════════ */
const ForgotPasswordForm = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Back button */}
            <button
                type="button"
                onClick={onBack}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.875rem',
                    marginBottom: '1.5rem', padding: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={16} /> Back to Sign In
            </button>

            <div className="mb-6">
                <h2 className="h3 mb-1">Reset Password</h2>
                <p className="text-muted text-sm">
                    Enter your email and we'll send you a link to reset your password.
                </p>
            </div>

            {error && <Alert type="error">{error}</Alert>}

            {sent ? (
                <div style={{
                    textAlign: 'center', padding: '2rem 1rem',
                    border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)'
                }}>
                    <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
                    <p className="font-medium mb-2">Check your inbox!</p>
                    <p className="text-muted text-sm">
                        We sent a password reset link to <strong>{email}</strong>.
                        It may take a minute to arrive.
                    </p>
                    <button
                        type="button"
                        onClick={onBack}
                        className="btn btn-secondary w-full mt-6"
                    >
                        Back to Sign In
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group mb-0">
                        <label className="label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={17} style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                pointerEvents: 'none'
                            }} />
                            <input
                                type="email"
                                required
                                className="input"
                                style={{ paddingLeft: 40 }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                autoFocus
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="btn btn-primary w-full"
                        style={{ height: 44 }}
                    >
                        {loading
                            ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} />
                            : 'Send Reset Link'}
                    </button>
                </form>
            )}
        </>
    );
};

/* ══════════════════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════════════════ */
const Login = () => {
    const { theme } = useTheme();
    const [view, setView] = useState('signin'); // 'signin' | 'forgot'

    return (
        <div className="login-container">
            <div
                className="card animate-fade-in"
                style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)' }}
            >
                {view === 'signin' ? (
                    <SignInForm
                        theme={theme}
                        onForgotPassword={() => setView('forgot')}
                    />
                ) : (
                    <ForgotPasswordForm onBack={() => setView('signin')} />
                )}
            </div>
        </div>
    );
};

export default Login;
