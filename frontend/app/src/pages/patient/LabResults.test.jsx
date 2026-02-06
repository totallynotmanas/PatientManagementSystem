import React from 'react';
import { render, screen } from '../../test-utils';
import LabResults from './LabResults';

describe('Lab Results Page', () => {
   test('renders lab results page', () => {
      const { container } = render(<LabResults />);
      expect(container).toBeInTheDocument();
   });

   test('displays lab results heading', () => {
      render(<LabResults />);
      expect(screen.getByText(/lab results/i)).toBeInTheDocument();
   });
});
