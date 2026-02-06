import React from 'react';
import { render } from '../../test-utils';
import RestrictedSection from './RestrictedSection';

describe('RestrictedSection Component', () => {
   test('renders children when allowed', () => {
      const { container } = render(
         <RestrictedSection allowedRoles={['patient']}>
            <div>Content</div>
         </RestrictedSection>
      );
      expect(container).toBeInTheDocument();
   });
});
