import React from 'react';
import { render, screen } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
   test('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
   });

   test('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      screen.getByText('Click me').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
   });

   test('renders with variant prop', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      expect(container.firstChild).toHaveClass('bg-white');
   });

   test('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByText('Disabled')).toBeDisabled();
   });
});
