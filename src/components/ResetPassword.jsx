
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

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
        {type === 'error'
            ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            : <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
        {children}
    </div>
);

/* ══════════════════════════════════════════════════
   RESET PASSWORD PAGE
   — Handles the link from the Supabase reset email
   — URL contains #access_token & type=recovery
══════════════════════════════════════════════════ */
const ResetPassword = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [sessionError, setSessionError] = useState(false);

    /* ── Listen for the SIGNED_IN / PASSWORD_RECOVERY event ── */
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                setSessionReady(true);
            }
        });

        // Also check if there's already a session (user clicked link, browser has token)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
            else {
                // Give Supabase a moment to exchange the token from the URL hash
                setTimeout(() => {
                    supabase.auth.getSession().then(({ data: { session: s } }) => {
                        if (s) setSessionReady(true);
                        else setSessionError(true);
                    });
                }, 1500);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /* ── Password strength check ── */
    const isStrong = password.length >= 8;
    const matches = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isStrong) { setError('Password must be at least 8 characters.'); return; }
        if (!matches) { setError('Passwords do not match.'); return; }

        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setDone(true);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div
                className="card animate-fade-in"
                style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)' }}
            >
                {/* Logo */}
                <div className="mb-8 text-center">
                    <img
                        src={theme === 'dark'
                            ? '/images/Souq_Route_white_red.png'
                            : '/images/souq-route-logo-black.png'}
                        alt="Souq Route"
                        style={{ width: '100%', maxWidth: '180px', height: 'auto', margin: '0 auto 20px', display: 'block' }}
                    />
                </div>

                {/* ── Invalid / Expired link ── */}
                {sessionError && !sessionReady && (
                    <>
                        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                            <AlertCircle size={48} color="#e21323" style={{ margin: '0 auto 1rem' }} />
                            <h2 className="h3 mb-2">Link Expired</h2>
                            <p className="text-muted text-sm">
                                This password reset link is invalid or has expired.<br />
                                Please request a new one.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="btn btn-primary w-full mt-6"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </>
                )}

                {/* ── Loading session ── */}
                {!sessionReady && !sessionError && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--primary)', margin: '0 auto 1rem' }} />
                        <p className="text-muted text-sm">Verifying your reset link…</p>
                    </div>
                )}

                {/* ── Success ── */}
                {done && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <CheckCircle size={52} color="#22c55e" style={{ margin: '0 auto 1.25rem' }} />
                        <h2 className="h3 mb-2">Password Updated!</h2>
                        <p className="text-muted text-sm">
                            Your password has been changed successfully.<br />
                            Redirecting you to Sign In…
                        </p>
                    </div>
                )}

                {/* ── Form ── */}
                {sessionReady && !done && (
                    <>
                        <div className="mb-6">
                            <h2 className="h3 mb-1">Set New Password</h2>
                            <p className="text-muted text-sm">Enter and confirm your new password below.</p>
                        </div>

                        {error && <Alert type="error">{error}</Alert>}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            {/* New Password */}
                            <div className="input-group mb-0">
                                <label className="label">New Password</label>
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
                                        placeholder="Min. 8 characters"
                                        autoFocus
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
                                        title={showPw ? 'Hide' : 'Show'}
                                    >
                                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 4,
                                        width: password.length === 0 ? '0%' : password.length < 8 ? '40%' : '100%',
                                        background: password.length === 0 ? 'transparent' : password.length < 8 ? '#f59e0b' : '#22c55e',
                                        transition: 'width 0.3s, background 0.3s',
                                    }} />
                                </div>
                                {password.length > 0 && !isStrong && (
                                    <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 4 }}>
                                        At least 8 characters required
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="input-group mb-0">
                                <label className="label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={17} style={{
                                        position: 'absolute', left: 12, top: '50%',
                                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                        pointerEvents: 'none'
                                    }} />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        className="input"
                                        style={{
                                            paddingLeft: 40, paddingRight: 42,
                                            borderColor: confirmPassword.length > 0
                                                ? (matches ? 'rgba(34,197,94,0.6)' : 'rgba(226,19,35,0.5)')
                                                : undefined
                                        }}
                                        value={confirmPassword}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Re-enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(v => !v)}
                                        style={{
                                            position: 'absolute', right: 10, top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', padding: '4px',
                                            display: 'flex', alignItems: 'center',
                                        }}
                                        title={showConfirm ? 'Hide' : 'Show'}
                                    >
                                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <p style={{ fontSize: '0.75rem', marginTop: 4, color: matches ? '#22c55e' : '#e21323' }}>
                                        {matches ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isStrong || !matches}
                                className="btn btn-primary w-full mt-2"
                                style={{ height: 44 }}
                            >
                                {loading
                                    ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} />
                                    : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
