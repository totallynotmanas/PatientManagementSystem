import React from 'react';
import { render, screen } from '../../test-utils';
import PatientDetail from './PatientDetail';

describe('Patient Detail Page', () => {
   test('renders patient detail page', () => {
      const { container } = render(<PatientDetail />);
      expect(container).toBeInTheDocument();
   });
});
