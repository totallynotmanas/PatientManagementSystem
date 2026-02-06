import React from 'react';
import { render, screen } from '../test-utils';
import Login from './login';

describe('Login Page', () => {
   test('renders login form', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
   });

   test('renders email and password inputs', () => {
      render(<Login />);
      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
   });

   test('renders create account button', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
   });

   test('displays welcome message', () => {
      render(<Login />);
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
   });
});
