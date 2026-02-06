import React from 'react';
import { render, screen } from '../../test-utils';
import Card from './Card';

describe('Card Component', () => {
   test('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
   });

   test('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
   });

   test('renders with default styling', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toHaveClass('bg-white');
   });
});
