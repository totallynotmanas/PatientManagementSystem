import React from 'react';
import { render } from '../../../test-utils';
import TreatmentModal from './TreatmentModal';

describe('TreatmentModal Component', () => {
   test('renders when open', () => {
      const { container } = render(
         <TreatmentModal isOpen={true} onClose={jest.fn()} />
      );
      expect(container).toBeInTheDocument();
   });
});
