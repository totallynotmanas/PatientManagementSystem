import React from 'react';
import { render, screen } from '../../test-utils';
import PatientDashboard from './Dashboard';

describe('Patient Dashboard', () => {
   test('renders dashboard', () => {
      const { container } = render(<PatientDashboard />);
      expect(container).toBeInTheDocument();
   });

   test('displays patient welcome message', () => {
      render(<PatientDashboard />);
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
   });
});
