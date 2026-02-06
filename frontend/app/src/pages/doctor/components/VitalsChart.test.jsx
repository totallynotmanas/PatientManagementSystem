import React from 'react';
import { render } from '../../../test-utils';
import DoctorVitalsChart from './VitalsChart';

describe('Doctor VitalsChart Component', () => {
   test('renders vitals chart', () => {
      const mockData = [];
      const { container } = render(<DoctorVitalsChart data={mockData} />);
      expect(container).toBeInTheDocument();
   });
});
