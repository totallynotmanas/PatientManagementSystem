import React from 'react';
import { render } from '../../test-utils';
import NurseDashboard from './Dashboard';

describe('Nurse Dashboard', () => {
   test('renders nurse dashboard', () => {
      const { container } = render(<NurseDashboard />);
      expect(container).toBeInTheDocument();
   });
});
