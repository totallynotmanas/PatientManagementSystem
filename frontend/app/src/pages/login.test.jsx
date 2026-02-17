import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import Login from './login';

// Mock the auth module
jest.mock('../mocks/auth', () => ({
    mockLogin: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    test('renders login form with all elements', () => {
        render(<Login />);
        
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders branding elements', () => {
        render(<Login />);
        
        expect(screen.getByText(/premium healthcare platform/i)).toBeInTheDocument();
    });

    test('shows validation error for empty email', async () => {
        render(<Login />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for short password', async () => {
        render(<Login />);
        
        const passwordInput = screen.getByPlaceholderText(/password/i);
        await userEvent.type(passwordInput, '12345');
        fireEvent.blur(passwordInput);
        
        await waitFor(() => {
            expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
        });
    });

    test('shows error when form submitted empty', async () => {
        render(<Login />);
        
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument();
        });
    });

    test('toggles password visibility', async () => {
        render(<Login />);
        
        const passwordInput = screen.getByPlaceholderText(/password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        const toggleButton = screen.getByLabelText(/show password/i);
        fireEvent.click(toggleButton);
        
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('navigates to forgot password page', async () => {
        render(<Login />);
        
        const forgotButton = screen.getByText(/forgot\?/i);
        fireEvent.click(forgotButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    test('navigates to create account page', async () => {
        render(<Login />);
        
        const createAccountLink = screen.getByText(/create account/i);
        expect(createAccountLink).toBeInTheDocument();
    });

    test('remembers email when remember me is checked', async () => {
        render(<Login />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        const rememberCheckbox = screen.getByRole('checkbox');
        
        await userEvent.type(emailInput, 'test@example.com');
        fireEvent.click(rememberCheckbox);
        
        expect(rememberCheckbox).toBeChecked();
    });

    test('loads remembered email on mount', () => {
        localStorage.setItem('rememberedEmail', 'saved@example.com');
        localStorage.setItem('rememberMe', 'true');
        
        render(<Login />);
        
        const emailInput = screen.getByPlaceholderText(/email/i);
        expect(emailInput).toHaveValue('saved@example.com');
    });
});
