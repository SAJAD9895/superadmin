
import React from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';

const SupportModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--space-4)'
            }}
            onClick={onClose}
        >
            <div
                className="card animate-fade-in"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-4)',
                        right: 'var(--space-4)',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-2)',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'var(--text-main)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div
                        className="icon-bg icon-bg-primary"
                        style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto var(--space-4)',
                            background: 'rgba(226, 19, 35, 0.1)'
                        }}
                    >
                        <AlertCircle size={32} color="#e21323" />
                    </div>
                    <h2 className="h3 mb-2">Update {type === 'logo' ? 'Logo' : 'Cover Image'}</h2>
                    <p className="text-muted">
                        To update your {type === 'logo' ? 'company logo' : 'cover image'}, please contact our support team.
                    </p>
                </div>

                <div
                    className="p-4 mb-6 rounded"
                    style={{
                        background: 'rgba(226, 19, 35, 0.05)',
                        border: '1px solid rgba(226, 19, 35, 0.2)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="icon-bg"
                            style={{
                                background: 'rgba(226, 19, 35, 0.1)',
                                width: '40px',
                                height: '40px'
                            }}
                        >
                            <Mail size={20} color="#e21323" />
                        </div>
                        <div>
                            <div className="text-sm text-muted mb-1">Contact Support</div>
                            <a
                                href="mailto:info@souqroute.com"
                                style={{
                                    color: '#e21323',
                                    fontWeight: 500,
                                    fontSize: '1.1rem',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                info@souqroute.com
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-muted text-center">
                    Our support team will assist you with updating your {type === 'logo' ? 'logo' : 'cover image'} within 24 hours.
                </div>

                <button
                    onClick={onClose}
                    className="btn btn-secondary w-full mt-6"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SupportModal;
