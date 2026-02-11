import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import TwoFactorAuth from './TwoFactorAuth';

// Mock the auth module
jest.mock('../mocks/auth', () => ({
    mockVerifyOTP: jest.fn(),
    mockVerifyBackupCode: jest.fn(),
    mockResendOTP: jest.fn(),
    RESEND_COOLDOWN_SECONDS: 30,
    MAX_VERIFICATION_ATTEMPTS: 5,
}));

import { mockVerifyOTP, mockVerifyBackupCode, mockResendOTP } from '../mocks/auth';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('TwoFactorAuth Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
        
        // Set up 2FA session data
        sessionStorage.setItem('2fa_temp_token', 'temp-token-123');
        sessionStorage.setItem('2fa_user', JSON.stringify({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            twoFactorMethod: 'email',
        }));
    });

    test('redirects to login if no 2FA session', () => {
        sessionStorage.clear();
        
        render(<TwoFactorAuth />);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('renders 2FA verification form', () => {
        render(<TwoFactorAuth />);
        
        expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
        expect(screen.getByText(/enter 6-digit verification code/i)).toBeInTheDocument();
    });

    test('renders 6 OTP input fields', () => {
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);
    });

    test('shows countdown timer for resend', () => {
        render(<TwoFactorAuth />);
        
        expect(screen.getByText(/resend code/i)).toBeInTheDocument();
    });

    test('focuses first input on mount', () => {
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        expect(inputs[0]).toHaveFocus();
    });

    test('allows typing digits in OTP inputs', async () => {
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        await userEvent.type(inputs[0], '1');
        
        expect(inputs[0]).toHaveValue('1');
        expect(inputs[1]).toHaveFocus();
    });

    test('only accepts digits in OTP inputs', async () => {
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        await userEvent.type(inputs[0], 'a');
        
        expect(inputs[0]).toHaveValue('');
    });

    test('shows backup code form when clicked', async () => {
        render(<TwoFactorAuth />);
        
        const backupCodeButton = screen.getByText(/use backup code instead/i);
        fireEvent.click(backupCodeButton);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/XXXX-XXXX-XXXX-XXXX/i)).toBeInTheDocument();
        });
    });

    test('shows security notice about code expiration', () => {
        render(<TwoFactorAuth />);
        
        expect(screen.getByText(/this code will expire in 10 minutes/i)).toBeInTheDocument();
    });

    test('shows help section when expanded', async () => {
        render(<TwoFactorAuth />);
        
        const helpButton = screen.getByText(/having trouble\?/i);
        fireEvent.click(helpButton);
        
        await waitFor(() => {
            expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
        });
    });

    test('navigates back to login', () => {
        render(<TwoFactorAuth />);
        
        const backButton = screen.getByText(/back to login/i);
        fireEvent.click(backButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('verifies OTP successfully', async () => {
        mockVerifyOTP.mockResolvedValue({ 
            success: true, 
            user: { id: '1', role: 'patient' } 
        });
        
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        await userEvent.type(inputs[0], '1');
        await userEvent.type(inputs[1], '2');
        await userEvent.type(inputs[2], '3');
        await userEvent.type(inputs[3], '4');
        await userEvent.type(inputs[4], '5');
        await userEvent.type(inputs[5], '6');
        
        await waitFor(() => {
            // Component calls mockVerifyOTP(code, tempToken)
            expect(mockVerifyOTP).toHaveBeenCalledWith('123456', 'temp-token-123');
        });
    });

    test('shows error for invalid OTP', async () => {
        mockVerifyOTP.mockResolvedValue({ 
            success: false, 
            error: 'Invalid code' 
        });
        
        render(<TwoFactorAuth />);
        
        const inputs = screen.getAllByRole('textbox');
        await userEvent.type(inputs[0], '1');
        await userEvent.type(inputs[1], '2');
        await userEvent.type(inputs[2], '3');
        await userEvent.type(inputs[3], '4');
        await userEvent.type(inputs[4], '5');
        await userEvent.type(inputs[5], '6');
        
        await waitFor(() => {
            expect(screen.getByText(/invalid code/i)).toBeInTheDocument();
        });
    });
});
