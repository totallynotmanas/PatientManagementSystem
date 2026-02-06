import React from 'react';
import { render, screen } from '../test-utils';
import CreateAccount from './createAccount';

describe('CreateAccount Page', () => {
   test('renders create account heading', () => {
      render(<CreateAccount />);
      expect(screen.getByText(/create your patient account/i)).toBeInTheDocument();
   });

   test('renders input fields', () => {
      render(<CreateAccount />);
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
   });

   test('renders submit button', () => {
      render(<CreateAccount />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
   });
});
