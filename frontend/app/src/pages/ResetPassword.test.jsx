import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ResetPassword from './ResetPassword';

// Mock the auth service
jest.mock('../services/supabaseAuth', () => ({
    validateResetToken: jest.fn(),
    resetPassword: jest.fn(),
}));

import { validateResetToken, resetPassword } from '../services/supabaseAuth';

// Mock useNavigate and useSearchParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('token=valid-token')],
}));

describe('ResetPassword Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows loading state while validating token', () => {
        validateResetToken.mockReturnValue(new Promise(() => {})); // Never resolves
        
        render(<ResetPassword />);
        
        expect(screen.getByText(/validating reset link/i)).toBeInTheDocument();
    });

    test('shows invalid token message for expired token', async () => {
        validateResetToken.mockResolvedValue({ valid: false });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
        });
    });

    test('renders reset password form for valid token', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByText(/set new password/i)).toBeInTheDocument();
        });
        
        expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
    });

    test('shows password strength requirements', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument();
        });
        
        // Multiple elements match this text, so use getAllByText
        expect(screen.getAllByText(/no common weak patterns/i).length).toBeGreaterThan(0);
    });

    test('shows validation error for short password', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);
        
        await waitFor(() => {
            expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for weak password pattern', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        await userEvent.type(passwordInput, 'mypassword123456');
        fireEvent.blur(passwordInput);
        
        await waitFor(() => {
            // Look specifically for the error message, not the strength indicator
            expect(screen.getByText(/password contains a common weak pattern/i)).toBeInTheDocument();
        });
    });

    test('shows validation error when passwords do not match', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
        
        // Use passwords without weak patterns
        await userEvent.type(passwordInput, 'StrongPass!@#12');
        await userEvent.type(confirmInput, 'DifferentPass!@#12');
        fireEvent.blur(confirmInput);
        
        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    test('submits form and shows success message', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        resetPassword.mockResolvedValue({ success: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
        
        // Use password without weak patterns (no 'password', '123456', 'qwerty', 'admin', 'letmein')
        await userEvent.type(passwordInput, 'StrongPass!@#12');
        await userEvent.type(confirmInput, 'StrongPass!@#12');
        
        const submitButton = screen.getByRole('button', { name: /reset password/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/password reset!/i)).toBeInTheDocument();
        });
    });

    test('shows error message on API failure', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        resetPassword.mockResolvedValue({ success: false, error: 'Password was recently used' });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
        
        // Use password without weak patterns
        await userEvent.type(passwordInput, 'StrongPass!@#12');
        await userEvent.type(confirmInput, 'StrongPass!@#12');
        
        const submitButton = screen.getByRole('button', { name: /reset password/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/password was recently used/i)).toBeInTheDocument();
        });
    });

    test('toggles password visibility', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        // Find the first toggle button (for new password field)
        const toggleButtons = screen.getAllByRole('button').filter(btn => 
            btn.classList.contains('text-gray-400')
        );
        fireEvent.click(toggleButtons[0]);
        
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('navigates to login after successful reset', async () => {
        validateResetToken.mockResolvedValue({ valid: true });
        resetPassword.mockResolvedValue({ success: true });
        
        render(<ResetPassword />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
        });
        
        const passwordInput = screen.getByPlaceholderText(/enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
        
        // Use password without weak patterns
        await userEvent.type(passwordInput, 'StrongPass!@#12');
        await userEvent.type(confirmInput, 'StrongPass!@#12');
        
        const submitButton = screen.getByRole('button', { name: /reset password/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/sign in with new password/i)).toBeInTheDocument();
        });
        
        const signInButton = screen.getByRole('button', { name: /sign in with new password/i });
        fireEvent.click(signInButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
