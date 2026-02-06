import React from 'react';
import { render, screen } from '../../test-utils';
import DoctorAppointments from './Appointments';

describe('Doctor Appointments Page', () => {
   test('renders appointments page', () => {
      const { container } = render(<DoctorAppointments />);
      expect(container).toBeInTheDocument();
   });

   test('displays appointments heading', () => {
      render(<DoctorAppointments />);
      expect(screen.getByText(/appointments/i)).toBeInTheDocument();
   });
});
