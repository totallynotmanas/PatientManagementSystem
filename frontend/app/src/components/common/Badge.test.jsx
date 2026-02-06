import React from 'react';
import { render, screen } from '../../test-utils';
import Badge from './Badge';

describe('Badge Component', () => {
   test('renders badge with children', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
   });

   test('applies correct color for green type', () => {
      const { container } = render(<Badge type="green">Success</Badge>);
      expect(container.firstChild).toHaveClass('bg-green-100');
   });

   test('applies correct color for red type', () => {
      const { container } = render(<Badge type="red">Error</Badge>);
      expect(container.firstChild).toHaveClass('bg-red-100');
   });

   test('applies correct color for yellow type', () => {
      const { container } = render(<Badge type="yellow">Warning</Badge>);
      expect(container.firstChild).toHaveClass('bg-yellow-100');
   });
});
