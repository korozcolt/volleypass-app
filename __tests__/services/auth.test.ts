import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../../services/auth';
import api from '../../services/api';
import { User, AuthResponse } from '../../types';
import { TEST_USERS, MOCK_API_RESPONSES } from '../test-data';

// Mock dependencies
jest.mock('../../services/api', () => ({
  default: {
    login: jest.fn(),
    logout: jest.fn(),
    updateUserProfile: jest.fn(),
    verifyToken: jest.fn(),
    getUserProfile: jest.fn(),
    getToken: jest.fn(),
    isAuthenticated: jest.fn()
  }
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  }
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockApi = api as any;

describe('AuthService', () => {
  let authService: AuthService;
  let mockListener: jest.Mock;

  const mockUser: User = {
    id: TEST_USERS.admin.id,
    name: TEST_USERS.admin.name,
    email: TEST_USERS.admin.email,
    first_name: TEST_USERS.admin.first_name,
    last_name: TEST_USERS.admin.last_name,
    roles: TEST_USERS.admin.roles,
    user_type: TEST_USERS.admin.user_type,
    phone: TEST_USERS.admin.phone
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: TEST_USERS.admin.token
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
    mockListener = jest.fn();
    
    // Reset service state
    authService['user'] = null;
    authService['isAuthenticated'] = false;
    authService['isLoading'] = false;
    authService['listeners'] = [];
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Listener Management', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const unsubscribe = authService.subscribe(mockListener);
      
      // Trigger notification
      authService['notifyListeners']();
      expect(mockListener).toHaveBeenCalledWith(null, false);
      
      // Unsubscribe
      unsubscribe();
      mockListener.mockClear();
      
      authService['notifyListeners']();
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should initialize without stored token', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      await authService.initialize();
      
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(authService.getIsAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBe(null);
    });

    it('should initialize with valid stored token', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('stored-token')
        .mockResolvedValueOnce(JSON.stringify(mockUser));
      mockApi.verifyToken.mockResolvedValue(true);
      
      await authService.initialize();
      
      expect(mockApi.verifyToken).toHaveBeenCalled();
      expect(authService.getIsAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toEqual(mockUser);
    });

    it('should handle invalid stored token', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-token');
      mockApi.verifyToken.mockResolvedValue(false);
      
      await authService.initialize();
      
      expect(mockApi.verifyToken).toHaveBeenCalled();
      expect(authService.getIsAuthenticated()).toBe(false);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      mockApi.login.mockResolvedValue(mockAuthResponse);
      authService.subscribe(mockListener);
      
      await authService.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      
      expect(mockApi.login).toHaveBeenCalledWith(TEST_USERS.admin.email, TEST_USERS.admin.password);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser));
      expect(authService.getIsAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toEqual(mockUser);
      expect(mockListener).toHaveBeenCalledWith(mockUser, true);
    });

    it('should handle login failure', async () => {
      const loginError = new Error('Invalid credentials');
      mockApi.login.mockRejectedValue(loginError);
      authService.subscribe(mockListener);
      
      await expect(authService.login(TEST_USERS.admin.email, 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
      
      expect(authService.getIsAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBe(null);
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Set up authenticated state
      authService['user'] = mockUser;
      authService['isAuthenticated'] = true;
    });

    it('should logout successfully', async () => {
      mockApi.logout.mockResolvedValue(undefined);
      authService.subscribe(mockListener);
      
      await authService.logout();
      
      expect(mockApi.logout).toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(authService.getIsAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBe(null);
      expect(mockListener).toHaveBeenCalledWith(null, false);
    });

    it('should handle logout API failure gracefully', async () => {
      mockApi.logout.mockRejectedValue(new Error('Network error'));
      authService.subscribe(mockListener);
      
      await authService.logout();
      
      // Should still clear local auth even if API call fails
      expect(authService.getIsAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBe(null);
    });
  });

  describe('User Profile Update', () => {
    beforeEach(() => {
      authService['user'] = mockUser;
      authService['isAuthenticated'] = true;
    });

    it('should update user profile successfully', async () => {
      const profileData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockApi.updateUserProfile.mockResolvedValue(updatedUser);
      authService.subscribe(mockListener);
      
      await authService.updateUserProfile(profileData);
      
      expect(mockApi.updateUserProfile).toHaveBeenCalledWith(profileData);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(updatedUser));
      expect(authService.getCurrentUser()).toEqual(updatedUser);
      expect(mockListener).toHaveBeenCalledWith(updatedUser, true);
    });

    it('should throw error when no user is logged in', async () => {
      authService['user'] = null;
      authService['isAuthenticated'] = false;
      
      await expect(authService.updateUserProfile({ name: 'Test' }))
        .rejects.toThrow('No user logged in');
    });

    it('should handle update failure', async () => {
      const updateError = new Error('Update failed');
      mockApi.updateUserProfile.mockRejectedValue(updateError);
      
      await expect(authService.updateUserProfile({ name: 'Test' }))
        .rejects.toThrow('Update failed');
    });
  });

  describe('User Update in Memory', () => {
    beforeEach(() => {
      authService['user'] = mockUser;
      authService['isAuthenticated'] = true;
    });

    it('should update user data in memory', () => {
      const updateData = { name: 'Updated Name' };
      authService.subscribe(mockListener);
      
      authService.updateUser(updateData);
      
      const updatedUser = authService.getCurrentUser();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(mockListener).toHaveBeenCalledWith(updatedUser, true);
    });

    it('should not update when no user is logged in', () => {
      authService['user'] = null;
      authService.subscribe(mockListener);
      
      authService.updateUser({ name: 'Test' });
      
      expect(authService.getCurrentUser()).toBe(null);
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      authService['user'] = {
        ...mockUser,
        roles: ['player', 'coach'],
        user_type: 'player'
      };
      authService['isAuthenticated'] = true;
    });

    it('should check if user has specific role', () => {
      expect(authService.hasRole('player')).toBe(true);
      expect(authService.hasRole('referee')).toBe(false);
    });

    it('should check if user has any of the specified roles', () => {
      expect(authService.hasAnyRole(['player', 'admin'])).toBe(true);
      expect(authService.hasAnyRole(['referee', 'admin'])).toBe(false);
    });

    it('should return false for role checks when not authenticated', () => {
      authService['user'] = null;
      authService['isAuthenticated'] = false;
      
      expect(authService.hasRole('player')).toBe(false);
      expect(authService.hasAnyRole(['player'])).toBe(false);
    });
  });

  describe('User Type Checks', () => {
    it('should check if user is player', () => {
      authService['user'] = { ...mockUser, user_type: 'player' };
      expect(authService.isPlayer()).toBe(true);
      
      authService['user'] = { ...mockUser, user_type: 'coach' };
      expect(authService.isPlayer()).toBe(false);
    });

    it('should check if user is coach', () => {
      authService['user'] = { ...mockUser, user_type: 'coach' };
      expect(authService.isCoach()).toBe(true);
      
      authService['user'] = { ...mockUser, user_type: 'player' };
      expect(authService.isCoach()).toBe(false);
    });

    it('should check if user is referee', () => {
      authService['user'] = { ...mockUser, user_type: 'referee' };
      expect(authService.isReferee()).toBe(true);
      
      authService['user'] = { ...mockUser, user_type: 'player' };
      expect(authService.isReferee()).toBe(false);
    });

    it('should check if user is admin', () => {
      authService['user'] = { ...mockUser, user_type: 'admin' };
      expect(authService.isAdmin()).toBe(true);
      
      authService['user'] = { ...mockUser, user_type: 'player' };
      expect(authService.isAdmin()).toBe(false);
    });

    it('should check if user is league', () => {
      authService['user'] = { ...mockUser, user_type: 'league' };
      expect(authService.isLeague()).toBe(true);
      
      authService['user'] = { ...mockUser, user_type: 'player' };
      expect(authService.isLeague()).toBe(false);
    });
  });

  describe('Permission Checks', () => {
    beforeEach(() => {
      authService['user'] = {
        ...mockUser,
        roles: ['player'],
        user_type: 'player'
      };
      authService['isAuthenticated'] = true;
    });

    it('should check if user can access public features', () => {
      expect(authService.canAccessPublicFeatures()).toBe(true);
      
      authService['isAuthenticated'] = false;
      expect(authService.canAccessPublicFeatures()).toBe(true);
    });

    it('should check if user can access authenticated features', () => {
      expect(authService.canAccessAuthenticatedFeatures()).toBe(true);
      
      authService['isAuthenticated'] = false;
      expect(authService.canAccessAuthenticatedFeatures()).toBe(false);
    });

    it('should get user permissions', () => {
      const permissions = authService.getUserPermissions();
      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should check specific permissions', () => {
      // This would depend on the actual permission implementation
      const hasPermission = authService.hasPermission('view_matches');
      expect(typeof hasPermission).toBe('boolean');
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      authService['user'] = {
        ...TEST_USERS.player,
        player_info: {
          position: 'Setter',
          jersey_number: 10,
          current_club: 'Test Club'
        }
      };
    });

    it('should get user club', () => {
      expect(authService.getUserClub()).toBe('Test Club');
      
      authService['user'] = { ...mockUser, player_info: undefined };
      expect(authService.getUserClub()).toBe(null);
    });

    it('should get player position', () => {
      expect(authService.getPlayerPosition()).toBe('Setter');
      
      authService['user'] = { ...mockUser, player_info: undefined };
      expect(authService.getPlayerPosition()).toBe(null);
    });

    it('should get player jersey number', () => {
      expect(authService.getPlayerJerseyNumber()).toBe(10);
      
      authService['user'] = { ...mockUser, player_info: undefined };
      expect(authService.getPlayerJerseyNumber()).toBe(null);
    });
  });

  describe('State Getters', () => {
    it('should get current user', () => {
      authService['user'] = mockUser;
      expect(authService.getCurrentUser()).toEqual(mockUser);
      
      authService['user'] = null;
      expect(authService.getCurrentUser()).toBe(null);
    });

    it('should get authentication status', () => {
      authService['isAuthenticated'] = true;
      expect(authService.getIsAuthenticated()).toBe(true);
      
      authService['isAuthenticated'] = false;
      expect(authService.getIsAuthenticated()).toBe(false);
    });

    it('should get loading status', () => {
      authService['isLoading'] = true;
      expect(authService.getIsLoading()).toBe(true);
      
      authService['isLoading'] = false;
      expect(authService.getIsLoading()).toBe(false);
    });
  });
});