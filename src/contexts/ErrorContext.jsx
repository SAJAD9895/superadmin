
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import GlobalErrorModal from '../components/GlobalErrorModal';

const ErrorContext = createContext();

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const showError = useCallback((message, title = 'Error', details = null) => {
        setError({ message, title, details });
    }, []);

    const hideError = useCallback(() => {
        setError(null);
    }, []);

    // Listen for global API errors dispatched from interceptors
    useEffect(() => {
        const handleGlobalError = (event) => {
            const { title, message, details } = event.detail;
            showError(message, title, details);
        };

        window.addEventListener('global-api-error', handleGlobalError);
        return () => {
            window.removeEventListener('global-api-error', handleGlobalError);
        };
    }, [showError]);

    return (
        <ErrorContext.Provider value={{ showError, hideError }}>
            {children}
            <GlobalErrorModal
                isOpen={!!error}
                onClose={hideError}
                title={error?.title}
                message={error?.message}
                details={error?.details}
            />
        </ErrorContext.Provider>
    );
};
