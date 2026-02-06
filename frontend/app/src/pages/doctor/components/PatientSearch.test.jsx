import React from 'react';
import { render } from '../../../test-utils';
import PatientSearch from './PatientSearch';

describe('PatientSearch Component', () => {
   test('renders patient search', () => {
      const { container } = render(<PatientSearch />);
      expect(container).toBeInTheDocument();
   });
});
