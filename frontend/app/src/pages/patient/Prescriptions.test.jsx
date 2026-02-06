import React from 'react';
import { render, screen } from '../../test-utils';
import Prescriptions from './Prescriptions';

describe('Prescriptions Page', () => {
   test('renders prescriptions page', () => {
      const { container } = render(<Prescriptions />);
      expect(container).toBeInTheDocument();
   });
});
