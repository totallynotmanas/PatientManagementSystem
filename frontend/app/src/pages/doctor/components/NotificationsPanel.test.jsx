import React from 'react';
import { render } from '../../../test-utils';
import NotificationsPanel from './NotificationsPanel';

describe('NotificationsPanel Component', () => {
   test('renders notifications panel', () => {
      const { container } = render(<NotificationsPanel />);
      expect(container).toBeInTheDocument();
   });
});
