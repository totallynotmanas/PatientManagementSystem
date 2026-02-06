import React from 'react';
import { render } from '../test-utils';
import DashboardLayout from './DashboardLayout';

describe('DashboardLayout Component', () => {
   test('renders layout', () => {
      const { container } = render(
         <DashboardLayout>
            <div>Content</div>
         </DashboardLayout>
      );
      expect(container).toBeInTheDocument();
   });
});
