import React from 'react';
import { render, screen } from '../../test-utils';
import MedicalHistory from './MedicalHistory';

describe('Medical History Page', () => {
   test('renders medical history page', () => {
      const { container } = render(<MedicalHistory />);
      expect(container).toBeInTheDocument();
   });
});
