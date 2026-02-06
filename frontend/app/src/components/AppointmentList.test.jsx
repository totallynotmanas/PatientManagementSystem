import React from 'react';
import { render, screen } from '../test-utils';
import AppointmentList from './AppointmentList';

describe('AppointmentList Component', () => {
   const mockAppointments = [
      {
         id: '1',
         patientName: 'John Doe',
         date: '2024-01-15',
         time: '10:00 AM',
         type: 'Check-up',
         status: 'Confirmed'
      },
      {
         id: '2',
         patientName: 'Jane Smith',
         date: '2024-01-16',
         time: '11:00 AM',
         type: 'Follow-up',
         status: 'Pending'
      }
   ];

   test('renders appointment list', () => {
      render(<AppointmentList appointments={mockAppointments} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
   });

   test('displays empty state when no appointments', () => {
      render(<AppointmentList appointments={[]} />);
      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument();
   });

   test('renders appointment times', () => {
      render(<AppointmentList appointments={mockAppointments} />);
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('11:00 AM')).toBeInTheDocument();
   });
});
