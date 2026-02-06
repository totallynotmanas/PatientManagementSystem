import React from 'react';
import { render } from '../test-utils';
import SchedulerView from './SchedulerView';

describe('SchedulerView Component', () => {
   test('renders scheduler', () => {
      const mockDate = new Date('2024-01-15');
      const mockOnClick = jest.fn();
      const mockOnDateChange = jest.fn();

      const { container } = render(
         <SchedulerView
            appointments={[]}
            selectedDate={mockDate}
            onAppointmentClick={mockOnClick}
            onDateChange={mockOnDateChange}
         />
      );
      expect(container).toBeInTheDocument();
   });
});
