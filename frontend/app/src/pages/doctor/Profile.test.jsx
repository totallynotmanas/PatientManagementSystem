import React from 'react';
import { render } from '../../test-utils';
import Profile from './Profile';

describe('Doctor Profile Page', () => {
   test('renders profile page', () => {
      const { container } = render(<Profile />);
      expect(container).toBeInTheDocument();
   });
});
