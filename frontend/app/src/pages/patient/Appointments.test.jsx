import React from 'react';
import { render, screen } from '../../test-utils';
import PatientAppointments from './Appointments';

describe('Patient Appointments Page', () => {
   test('renders appointments page', () => {
      const { container } = render(<PatientAppointments />);
      expect(container).toBeInTheDocument();
   });

   test('displays my appointments heading', () => {
      render(<PatientAppointments />);
      expect(screen.getByText(/my appointments/i)).toBeInTheDocument();
   });

   test('displays request new button', () => {
      render(<PatientAppointments />);
      expect(screen.getByRole('button', { name: /request new/i })).toBeInTheDocument();
   });
});
