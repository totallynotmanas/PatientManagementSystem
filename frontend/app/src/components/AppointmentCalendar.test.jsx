import React from 'react';
import { render, screen } from '../test-utils';
import AppointmentCalendar from './AppointmentCalendar';

describe('AppointmentCalendar Component', () => {
   test('renders calendar', () => {
      const { container } = render(<AppointmentCalendar appointments={[]} />);
      expect(container).toBeInTheDocument();
   });
});
