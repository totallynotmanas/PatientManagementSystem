import React from 'react';
import { render, screen } from '../../test-utils';
import Patients from './Patients';

describe('Patients Page', () => {
   test('renders patients page', () => {
      const { container } = render(<Patients />);
      expect(container).toBeInTheDocument();
   });
});
