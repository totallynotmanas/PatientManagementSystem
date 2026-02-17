import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword';

// Mock the auth service
jest.mock('../services/supabaseAuth', () => ({
    forgotPassword: jest.fn(),
}));

import { forgotPassword } from '../services/supabaseAuth';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('ForgotPassword Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders forgot password form', () => {
        render(<ForgotPassword />);
        
        expect(screen.getByText(/reset password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    test('renders branding elements', () => {
        render(<ForgotPassword />);
        
        expect(screen.getAllByText(/securehealth/i).length).toBeGreaterThan(0);
    });

    test('shows validation error for empty email', async () => {
        render(<ForgotPassword />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for invalid email', async () => {
        render(<ForgotPassword />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        await userEvent.type(emailInput, 'invalidemail');
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
            expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
        });
    });

    test('submits form and shows success message', async () => {
        forgotPassword.mockResolvedValue({ success: true });
        
        render(<ForgotPassword />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        await userEvent.type(emailInput, 'test@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send reset link/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument();
        });
    });

    test('shows success message even on API error for security', async () => {
        forgotPassword.mockRejectedValue(new Error('API Error'));
        
        render(<ForgotPassword />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        await userEvent.type(emailInput, 'test@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send reset link/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument();
        });
    });

    test('navigates back to login', () => {
        render(<ForgotPassword />);
        
        const backButton = screen.getByText(/back to login/i);
        fireEvent.click(backButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('has link to sign in page', () => {
        render(<ForgotPassword />);
        
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toHaveAttribute('href', '/login');
    });

    test('disables submit button when email is empty', () => {
        render(<ForgotPassword />);
        
        const submitButton = screen.getByRole('button', { name: /send reset link/i });
        expect(submitButton).toBeDisabled();
    });

    test('enables submit button when valid email is entered', async () => {
        render(<ForgotPassword />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        await userEvent.type(emailInput, 'test@example.com');
        
        const submitButton = screen.getByRole('button', { name: /send reset link/i });
        expect(submitButton).not.toBeDisabled();
    });
});
