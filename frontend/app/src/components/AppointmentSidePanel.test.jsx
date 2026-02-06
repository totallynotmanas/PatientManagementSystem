import React from 'react';
import { render, screen } from '../test-utils';
import AppointmentSidePanel from './AppointmentSidePanel';

describe('AppointmentSidePanel Component', () => {
   test('renders correctly when open', () => {
      const mockOnClose = jest.fn();
      const mockAppointment = {
         id: '1',
         patientName: 'Test Patient',
         patientId: 'P123',
         status: 'Confirmed',
         date: '2023-10-10',
         time: '10:00 AM',
         duration: 30,
         type: 'Checkup',
         room: '101',
         doctorName: 'Dr. Smith'
      };

      render(
         <AppointmentSidePanel
            appointment={mockAppointment}
            onClose={mockOnClose}
            onAction={jest.fn()}
         />
      );

      // Check for specific text content
      expect(screen.getByText('Appointment Details')).toBeInTheDocument();
      expect(screen.getByText('Test Patient')).toBeInTheDocument();
   });
});
