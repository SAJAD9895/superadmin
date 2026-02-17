
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const GlobalErrorModal = ({ isOpen, onClose, title = 'Error', message, details }) => {
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
                zIndex: 2000,
                padding: 'var(--space-4)'
            }}
            onClick={onClose}
        >
            <div
                className="card animate-fade-in"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative',
                    border: '1px solid rgba(226, 19, 35, 0.3)',
                    background: 'var(--bg-card)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-4)',
                        right: 'var(--space-4)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div
                        className="icon-bg"
                        style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto var(--space-4)',
                            background: 'rgba(226, 19, 35, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                        }}
                    >
                        <AlertTriangle size={32} color="#e21323" />
                    </div>
                    <h2 className="h3 mb-2" style={{ color: '#e21323' }}>{title}</h2>
                    <p className="text-muted" style={{ fontSize: '1rem' }}>
                        {message || 'An unexpected error occurred.'}
                    </p>
                    {details && (
                        <div className="mt-4 p-3 rounded" style={{ background: 'rgba(0,0,0,0.3)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', overflowX: 'auto' }}>
                            <code>{JSON.stringify(details, null, 2)}</code>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="btn btn-secondary w-full"
                    style={{ borderColor: 'rgba(226, 19, 35, 0.3)', color: '#e21323' }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(226, 19, 35, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default GlobalErrorModal;
