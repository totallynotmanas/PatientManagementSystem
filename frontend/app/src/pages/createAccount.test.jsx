import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import CreateAccount from './createAccount';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('CreateAccount Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders patient signup form by default', () => {
        render(<CreateAccount />);

        expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        // Patient specific fields
        expect(screen.getByText(/date of birth/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/new york, ny/i)).toBeInTheDocument(); // Address
    });

    test('switches to doctor form when doctor role selected', async () => {
        render(<CreateAccount />);

        const doctorButton = screen.getByText(/doctor \/ staff/i);
        fireEvent.click(doctorButton);

        // Doctor specific fields should appear
        expect(screen.getByPlaceholderText(/lic-12345/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/cardiology/i)).toBeInTheDocument();

        // Patient fields should disappear
        expect(screen.queryByText(/date of birth/i)).not.toBeInTheDocument();
    });

    test('shows error when passwords do not match', async () => {
        render(<CreateAccount />);

        const nameInput = screen.getByPlaceholderText(/john doe/i);
        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/min 12 characters/i);
        const confirmInput = screen.getByPlaceholderText(/re-enter password/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'SecurePass123!');
        await userEvent.type(confirmInput, 'DifferentPass123!');

        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    test('shows error for short password', async () => {
        render(<CreateAccount />);

        const nameInput = screen.getByPlaceholderText(/john doe/i);
        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/min 12 characters/i);
        const confirmInput = screen.getByPlaceholderText(/re-enter password/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, '12345');
        await userEvent.type(confirmInput, '12345');

        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
        });
    });

    test('shows error when required fields are empty', async () => {
        render(<CreateAccount />);

        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
        });
    });

    test('navigates to sign in page', async () => {
        render(<CreateAccount />);

        const signInLink = screen.getByText(/already have an account\? sign in/i);
        fireEvent.click(signInLink);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
