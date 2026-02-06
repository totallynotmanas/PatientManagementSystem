import React from 'react';
import { render, screen } from '../../test-utils';
import AdminDashboard from './Dashboard';

describe('Admin Dashboard', () => {
   test('renders dashboard', () => {
      const { container } = render(<AdminDashboard />);
      expect(container).toBeInTheDocument();
   });
});
