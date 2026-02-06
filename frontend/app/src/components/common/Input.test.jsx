import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Input from './Input';

describe('Input Component', () => {
   test('renders input with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
   });

   test('handles value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
   });

   test('displays error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
   });

   test('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
   });
});
