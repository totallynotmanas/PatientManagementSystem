import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthContext } from './contexts/AuthContext';

// Mocks removed - using patched package.json for resolution

// Mock auth context value
const mockAuthValue = {
  user: null,
  session: null,
  loading: false,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: false,
};

test('renders learn react link', () => {
  window.history.pushState({}, 'Test page', '/');

  // We wrap App in AuthContext.Provider because Login page calls useAuth
  const { debug } = render(
    <AuthContext.Provider value={mockAuthValue}>
      <App />
    </AuthContext.Provider>
  );

  // Debug output to see what's rendering if it fails
  // debug(); 

  // App renders Login page by default which has text "Sign In"
  expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
});
