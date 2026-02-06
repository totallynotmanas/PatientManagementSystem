import React from 'react';
import { render } from '../test-utils';
import VitalsChart from './VitalsChart';

describe('VitalsChart Component', () => {
   test('renders chart', () => {
      const mockData = [];
      const { container } = render(<VitalsChart data={mockData} />);
      expect(container).toBeInTheDocument();
   });
});
