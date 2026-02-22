
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/* ── Inline Alert ─────────────────────────────────── */
const Alert = ({ type, children }) => (
    <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        background: type === 'error' ? 'rgba(226,19,35,0.08)' : 'rgba(34,197,94,0.08)',
        border: `1px solid ${type === 'error' ? 'rgba(226,19,35,0.3)' : 'rgba(34,197,94,0.3)'}`,
        color: type === 'error' ? '#e21323' : '#22c55e',
    }}>
        {type === 'error'
            ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            : <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
        <span>{children}</span>
    </div>
);

/* ══════════════════════════════════════════════════════
   RESET PASSWORD PAGE
   Flow:
   1. Parse URL hash for #error= (expired/invalid link)
   2. If no error → listen for PASSWORD_RECOVERY session
   3. Show form once session is ready
   4. On submit → updateUser({ password }) → redirect /login
══════════════════════════════════════════════════════ */
const ResetPassword = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    /* ---------- state ---------- */
    const [view, setView] = useState('loading'); // loading | expired | form | success
    const [errorMsg, setErrorMsg] = useState('');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [formErr, setFormErr] = useState(null);
    const [submitting, setSubmit] = useState(false);

    /* ---------- 1. Read URL hash on mount ---------- */
    useEffect(() => {
        const hash = window.location.hash; // e.g. #error=access_denied&error_code=otp_expired…

        if (hash.includes('error=')) {
            // Parse error from hash
            const params = new URLSearchParams(hash.replace(/^#/, ''));
            const desc = params.get('error_description') || 'Your reset link is invalid or has expired.';
            setErrorMsg(decodeURIComponent(desc.replace(/\+/g, ' ')));
            setView('expired');
            return; // stop here — don't set up session listener
        }

        /* ---------- 2. No error in hash → wait for Supabase session ---------- */
        // Supabase SDK auto-exchanges the #access_token from the URL hash.
        // We just need to listen for the PASSWORD_RECOVERY event.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setView('form');
            }
        });

        // Also check if session already exists (page refresh scenario)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setView('form');
            } else {
                // Give SDK 2s to exchange token from hash
                setTimeout(() => {
                    supabase.auth.getSession().then(({ data: { session: s } }) => {
                        if (s) { setView('form'); }
                        else { setErrorMsg('Reset link has expired or already been used.'); setView('expired'); }
                    });
                }, 2000);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /* ---------- helpers ---------- */
    const isStrong = password.length >= 8;
    const matches = password === confirm && confirm.length > 0;

    /* ---------- 3. Submit new password ---------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isStrong) { setFormErr('Password must be at least 8 characters.'); return; }
        if (!matches) { setFormErr('Passwords do not match.'); return; }

        setFormErr(null);
        setSubmit(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setView('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setFormErr(err.message);
        } finally {
            setSubmit(false);
        }
    };

    /* ---------- 4. Render ---------- */
    const logo = theme === 'dark'
        ? '/images/Souq_Route_white_red.png'
        : '/images/souq-route-logo-black.png';

    return (
        <div className="login-container">
            <div
                className="card animate-fade-in"
                style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)' }}
            >
                {/* Logo */}
                <div className="mb-8 text-center">
                    <img
                        src={logo}
                        alt="Souq Route"
                        style={{ width: '100%', maxWidth: '180px', height: 'auto', margin: '0 auto 20px', display: 'block' }}
                    />
                </div>

                {/* ── Loading ─────────────────────────────── */}
                {view === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--primary)', margin: '0 auto 1rem', display: 'block' }} />
                        <p className="text-muted text-sm">Verifying your reset link…</p>
                    </div>
                )}

                {/* ── Expired / Invalid ────────────────────── */}
                {view === 'expired' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(226,19,35,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <AlertCircle size={32} color="#e21323" />
                        </div>
                        <h2 className="h3 mb-2">Link Expired</h2>
                        <p className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                            {errorMsg}
                        </p>
                        <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>
                            Reset links expire after <strong style={{ color: 'var(--text-main)' }}>1 hour</strong> and can only be used once.
                            Please request a new one.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="btn btn-primary w-full"
                            style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <RefreshCw size={16} /> Request New Link
                        </button>
                    </div>
                )}

                {/* ── Success ─────────────────────────────── */}
                {view === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(34,197,94,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <CheckCircle size={32} color="#22c55e" />
                        </div>
                        <h2 className="h3 mb-2">Password Updated!</h2>
                        <p className="text-muted text-sm">
                            Your password has been changed successfully.<br />
                            Redirecting you to Sign In…
                        </p>
                    </div>
                )}

                {/* ── Form ──────────────────────────────────── */}
                {view === 'form' && (
                    <>
                        <div className="mb-6">
                            <h2 className="h3 mb-1">Set New Password</h2>
                            <p className="text-muted text-sm">Enter and confirm your new password below.</p>
                        </div>

                        {formErr && <Alert type="error">{formErr}</Alert>}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            {/* ── New Password ── */}
                            <div className="input-group mb-0">
                                <label className="label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={17} style={{
                                        position: 'absolute', left: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)', pointerEvents: 'none',
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
                                            color: 'var(--text-muted)', padding: 4,
                                            display: 'flex', alignItems: 'center',
                                        }}
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

                            {/* ── Confirm Password ── */}
                            <div className="input-group mb-0">
                                <label className="label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={17} style={{
                                        position: 'absolute', left: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)', pointerEvents: 'none',
                                    }} />
                                    <input
                                        type={showCf ? 'text' : 'password'}
                                        required
                                        className="input"
                                        style={{
                                            paddingLeft: 40, paddingRight: 42,
                                            borderColor: confirm.length > 0
                                                ? (matches ? 'rgba(34,197,94,0.6)' : 'rgba(226,19,35,0.5)')
                                                : undefined,
                                        }}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Re-enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCf(v => !v)}
                                        style={{
                                            position: 'absolute', right: 10, top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', padding: 4,
                                            display: 'flex', alignItems: 'center',
                                        }}
                                    >
                                        {showCf ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {confirm.length > 0 && (
                                    <p style={{ fontSize: '0.75rem', marginTop: 4, color: matches ? '#22c55e' : '#e21323' }}>
                                        {matches ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !isStrong || !matches}
                                className="btn btn-primary w-full mt-2"
                                style={{ height: 44 }}
                            >
                                {submitting
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
