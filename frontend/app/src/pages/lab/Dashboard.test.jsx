import React from 'react';
import { render } from '../../test-utils';
import LabDashboard from './Dashboard';

describe('Lab Dashboard', () => {
   test('renders lab dashboard', () => {
      const { container } = render(<LabDashboard />);
      expect(container).toBeInTheDocument();
   });
});
