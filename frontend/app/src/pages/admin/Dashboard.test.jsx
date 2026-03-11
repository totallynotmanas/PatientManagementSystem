import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from './Dashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock the lucide-react icons to avoid issues during testing
jest.mock('lucide-react', () => ({
   Users: () => <div data-testid="icon-users" />,
   Shield: () => <div data-testid="icon-shield" />,
   AlertCircle: () => <div data-testid="icon-alert" />,
   FileText: () => <div data-testid="icon-file" />,
   Activity: () => <div data-testid="icon-activity" />,
   LayoutDashboard: () => <div data-testid="icon-dashboard" />,
   Clock: () => <div data-testid="icon-clock" />,
   ArrowUp: () => <div data-testid="icon-arrow-up" />,
   ArrowDown: () => <div data-testid="icon-arrow-down" />,
   Search: () => <div data-testid="icon-search" />,
   Filter: () => <div data-testid="icon-filter" />,
   MoreVertical: () => <div data-testid="icon-more" />,
   Edit: () => <div data-testid="icon-edit" />,
   Trash2: () => <div data-testid="icon-trash" />,
   UserCheck: () => <div data-testid="icon-check" />,
   UserX: () => <div data-testid="icon-x" />,
   Key: () => <div data-testid="icon-key" />,
   Lock: () => <div data-testid="icon-lock" />,
   FileCheck: () => <div data-testid="icon-file-check" />,
   AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
   CheckCircle: () => <div data-testid="icon-check-circle" />,
   MoreHorizontal: () => <div data-testid="icon-more-horizontal" />,
   Download: () => <div data-testid="icon-download" />,
   Server: () => <div data-testid="icon-server" />,
   Database: () => <div data-testid="icon-database" />,
   Cpu: () => <div data-testid="icon-cpu" />,
   UserPlus: () => <div data-testid="icon-user-plus" />,
}));

describe('AdminDashboard', () => {
   test('renders the dashboard header', () => {
      // Act
      render(
         <BrowserRouter>
            <AdminDashboard />
         </BrowserRouter>
      );

      // Assert
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
   });
});
