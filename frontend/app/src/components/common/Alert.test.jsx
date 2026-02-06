import React from 'react';
import { render, screen } from '../../test-utils';
import Alert from './Alert';

describe('Alert Component', () => {
   test('renders alert with message', () => {
      render(<Alert type="info" message="Test alert message" />);
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
   });

   test('renders success alert', () => {
      const { container } = render(<Alert type="success" message="Success!" />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
   });

   test('renders error alert', () => {
      const { container } = render(<Alert type="error" message="Error occurred" />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
   });

   test('renders warning alert', () => {
      const { container } = render(<Alert type="warning" message="Warning!" />);
      expect(screen.getByText('Warning!')).toBeInTheDocument();
   });
});
