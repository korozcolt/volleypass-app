import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { AuthResponse, User, Match, Tournament } from '../../types';
import { TEST_USERS, MOCK_API_RESPONSES } from '../test-data';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('VolleyPassAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockAuthResponse: AuthResponse = {
        user: TEST_USERS.admin,
        token: TEST_USERS.admin.token
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockAuthResponse
        })
      } as Response);

      const result = await api.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: TEST_USERS.admin.email,
            password: TEST_USERS.admin.password
          })
        })
      );

      expect(result).toEqual(mockAuthResponse);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', TEST_USERS.admin.token);
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Invalid credentials'
        })
      } as Response);

      await expect(api.login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should logout successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      await api.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/auth/logout',
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('User Profile', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');
    });

    it('should get user profile', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        roles: ['player'],
        user_type: 'player'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUser
        })
      } as Response);

      const result = await api.getUserProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/users/profile',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const profileData = { name: 'Updated Name' };
      const updatedUser: User = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        first_name: 'Updated',
        last_name: 'Name',
        roles: ['player'],
        user_type: 'player'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedUser
        })
      } as Response);

      const result = await api.updateUserProfile(profileData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/users/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(profileData)
        })
      );

      expect(result).toEqual(updatedUser);
    });
  });

  describe('Matches', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');
    });

    it('should get live matches', async () => {
      const mockMatches: Match[] = [
        {
          id: 1,
          home_team: {
            id: 1,
            name: 'Team A',
            logo: '',
            club: { id: 1, name: 'Club A' },
            category: { id: 1, name: 'Senior', gender: 'male' }
          },
          away_team: {
            id: 2,
            name: 'Team B',
            logo: '',
            club: { id: 2, name: 'Club B' },
            category: { id: 1, name: 'Senior', gender: 'male' }
          },
          status: 'in_progress',
          scheduled_at: '2024-01-01T10:00:00Z',
          venue: { id: 1, name: 'Court 1', address: 'Address 1' },
          tournament: {
            id: 1,
            name: 'Tournament 1',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-01-31',
            league: { id: 1, name: 'League 1' },
            categories: []
          },
          home_sets: 1,
          away_sets: 0
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockMatches
        })
      } as Response);

      const result = await api.getLiveMatches();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/matches/live',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockMatches);
    });

    it('should get match by id', async () => {
      const mockMatch: Match = {
        id: 1,
        home_team: {
          id: 1,
          name: 'Team A',
          logo: '',
          club: { id: 1, name: 'Club A' },
          category: { id: 1, name: 'Senior', gender: 'male' }
        },
        away_team: {
          id: 2,
          name: 'Team B',
          logo: '',
          club: { id: 2, name: 'Club B' },
          category: { id: 1, name: 'Senior', gender: 'male' }
        },
        status: 'completed',
        scheduled_at: '2024-01-01T10:00:00Z',
        venue: { id: 1, name: 'Court 1', address: 'Address 1' },
        tournament: {
          id: 1,
          name: 'Tournament 1',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          league: { id: 1, name: 'League 1' },
          categories: []
        },
        home_sets: 3,
        away_sets: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockMatch
        })
      } as Response);

      const result = await api.getMatch(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/matches/1',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockMatch);
    });
  });

  describe('Tournaments', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');
    });

    it('should get tournaments', async () => {
      const mockTournaments: Tournament[] = [
        {
          id: 1,
          name: 'Tournament 1',
          description: 'Test tournament',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          league: { id: 1, name: 'League 1' },
          categories: [],
          teams_count: 8,
          matches_count: 16
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTournaments
        })
      } as Response);

      const result = await api.getTournaments();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://volleypass-new.test/api/tournaments',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockTournaments);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getLiveMatches())
        .rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: 'Internal server error'
        })
      } as Response);

      await expect(api.getLiveMatches())
        .rejects.toThrow('Internal server error');
    });
  });

  describe('Token Management', () => {
    it('should load token on initialization', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('stored-token');
      
      // Create new instance to test token loading
      const { api: newApi } = await import('../../services/api');
      
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(newApi.getToken()).toBe('stored-token');
    });

    it('should return authentication status', () => {
      expect(api.isAuthenticated()).toBe(false);
      
      // Simulate token being set
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');
      
      // Note: In real implementation, this would require the token to be loaded
      // This is a simplified test
    });
  });
});