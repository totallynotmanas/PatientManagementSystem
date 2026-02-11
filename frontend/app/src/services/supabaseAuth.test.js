import * as authService from './supabaseAuth';

describe('supabaseAuth Service', () => {
   beforeEach(() => {
      jest.resetAllMocks();
      global.fetch = jest.fn();
   });

   test('signIn calls login and returns formatted result', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = { user: mockUser, message: 'Login successful', email: 'test@example.com', role: 'PATIENT' };

      global.fetch.mockResolvedValueOnce({
         ok: true,
         json: async () => mockResponse,
      });

      const result = await authService.signIn('test@example.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith(
         expect.stringContaining('/auth/login'),
         expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
         })
      );

      // signIn returns session with user object only (no token from this backend)
      expect(result).toEqual({
         success: true,
         user: expect.objectContaining({ email: 'test@example.com' }),
         session: { user: expect.objectContaining({ email: 'test@example.com' }) },
         status: 'Login successful',
      });
   });

   test('signIn handles error', async () => {
      global.fetch.mockResolvedValueOnce({
         ok: false,
         json: async () => ({ message: 'Invalid credentials' }),
      });

      const result = await authService.signIn('test@example.com', 'wrong');

      expect(result).toEqual({
         success: false,
         error: 'Invalid credentials',
      });
   });

   test('signOut calls logout', async () => {
      // signOut clears local session (no backend call - backend has no logout endpoint)
      const result = await authService.signOut();

      expect(result).toEqual({ success: true });
   });
});
