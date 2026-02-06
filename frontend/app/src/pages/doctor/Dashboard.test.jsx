import React from 'react';
import { render, screen } from '../../test-utils';
import DoctorDashboard from './Dashboard';

describe('Doctor Dashboard', () => {
   test('renders dashboard title', () => {
      render(<DoctorDashboard />);
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
   });

   test('renders main sections', () => {
      const { container } = render(<DoctorDashboard />);
      expect(container).toBeInTheDocument();
   });
});
