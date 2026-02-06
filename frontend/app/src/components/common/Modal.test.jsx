import React from 'react';
import { render, screen } from '../../test-utils';
import Modal from './Modal';

describe('Modal Component', () => {
   test('renders modal when isOpen is true', () => {
      render(
         <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
            <p>Modal content</p>
         </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
   });

   test('does not render when isOpen is false', () => {
      const { container } = render(
         <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
            <p>Modal content</p>
         </Modal>
      );
      expect(container.firstChild).toBeNull();
   });

   test('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
         <Modal isOpen={true} onClose={handleClose} title="Test Modal">
            <p>Modal content</p>
         </Modal>
      );
      const closeButton = screen.getAllByRole('button')[0];
      closeButton.click();
      expect(handleClose).toHaveBeenCalled();
   });
});
