// Test data and mock users for testing

export const TEST_USERS = {
  admin: {
    email: 'ing.korozco+admin@gmail.com',
    password: 'Admin123',
    id: 1,
    name: 'Admin User',
    first_name: 'Admin',
    last_name: 'User',
    roles: ['admin'],
    user_type: 'admin' as const,
    phone: '+1234567890',
    token: 'mock-admin-token'
  },
  player: {
    email: 'test.player@example.com',
    password: 'Player123',
    id: 2,
    name: 'Test Player',
    first_name: 'Test',
    last_name: 'Player',
    roles: ['player'],
    user_type: 'player' as const,
    phone: '+1234567891',
    token: 'mock-player-token'
  },
  coach: {
    email: 'test.coach@example.com',
    password: 'Coach123',
    id: 3,
    name: 'Test Coach',
    first_name: 'Test',
    last_name: 'Coach',
    roles: ['coach'],
    user_type: 'coach' as const,
    phone: '+1234567892',
    token: 'mock-coach-token'
  },
  referee: {
    email: 'test.referee@example.com',
    password: 'Referee123',
    id: 4,
    name: 'Test Referee',
    first_name: 'Test',
    last_name: 'Referee',
    roles: ['referee'],
    user_type: 'referee' as const,
    phone: '+1234567893',
    token: 'mock-referee-token'
  }
};

export const MOCK_API_RESPONSES = {
  login: {
    success: {
      user: TEST_USERS.admin,
      token: TEST_USERS.admin.token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    error: {
      message: 'Invalid credentials'
    }
  },
  tournaments: [
    {
      id: 1,
      name: 'Test Tournament',
      description: 'Tournament for testing',
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }
  ],
  matches: [
    {
      id: 1,
      tournament_id: 1,
      home_team: 'Team A',
      away_team: 'Team B',
      match_date: '2024-01-15T10:00:00Z',
      status: 'scheduled'
    }
  ]
};

export const MOCK_NOTIFICATIONS = {
  payment: {
    title: 'Pago Pendiente',
    body: 'Tienes un pago pendiente por $50.00',
    data: {
      type: 'payment',
      amount: 50.00,
      currency: 'USD'
    }
  },
  match: {
    title: 'Próximo Partido',
    body: 'Tu partido comienza en 1 hora',
    data: {
      type: 'match',
      matchId: 1,
      teams: 'Team A vs Team B'
    }
  }
};