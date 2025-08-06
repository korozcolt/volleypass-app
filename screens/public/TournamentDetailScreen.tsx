import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Button,
  Divider,
  List,
  FAB,
} from 'react-native-paper';
import api from '../../services/api';
import { Tournament, Match, Standing, Team } from '../../types';

interface TournamentDetailScreenProps {
  navigation: any;
  route: {
    params: {
      tournamentId: string;
    };
  };
}

const TournamentDetailScreen: React.FC<TournamentDetailScreenProps> = ({ navigation, route }) => {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'teams'>('matches');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const tournamentResponse = await api.getTournament(tournamentId);
      setTournament(tournamentResponse);
      
      // Cargar datos según la pestaña activa
      await loadTabData(activeTab);
      
      setError(null);
    } catch (err) {
      console.error('Error loading tournament data:', err);
      setError('Error al cargar los datos del torneo');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: 'matches' | 'standings' | 'teams') => {
    try {
      switch (tab) {
        case 'matches':
          const matchesResponse = await api.getMatches({ tournament_id: tournamentId });
          setMatches(matchesResponse);
          break;
        case 'standings':
          const standingsResponse = await api.getTournamentStandings(tournamentId);
          setStandings(standingsResponse);
          break;
        case 'teams':
          const teamsResponse = await api.getTeams({ tournament_id: tournamentId });
          setTeams(teamsResponse);
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournamentData();
    setRefreshing(false);
  };

  const handleTabChange = async (tab: 'matches' | 'standings' | 'teams') => {
    setActiveTab(tab);
    await loadTabData(tab);
  };

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'finished': return '#2196f3';
      case 'upcoming': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIVO';
      case 'finished': return 'FINALIZADO';
      case 'upcoming': return 'PRÓXIMO';
      case 'cancelled': return 'CANCELADO';
      default: return status.toUpperCase();
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'scheduled': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const renderMatches = () => (
    <View>
      {matches.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#666' }}>No hay partidos disponibles</Text>
        </View>
      ) : (
        matches.map((match) => (
          <Card
            key={match.id}
            style={{ marginBottom: 12 }}
            onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
          >
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  {new Date(match.scheduled_at).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Chip 
                  compact
                  style={{ backgroundColor: getMatchStatusColor(match.status) }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {match.status === 'in_progress' ? 'EN VIVO' : 
                   match.status === 'completed' ? 'FINALIZADO' :
                   match.status === 'scheduled' ? 'PROGRAMADO' : 'CANCELADO'}
                </Chip>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {match.home_team.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {match.home_team.club?.name}
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    {match.home_sets || 0} - {match.away_sets || 0}
                  </Text>
                  {match.status === 'in_progress' && (
                    <Text variant="bodySmall" style={{ color: '#4caf50' }}>
                      Set {match.current_set || 1}
                    </Text>
                  )}
                </View>
                
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {match.away_team.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {match.away_team.club?.name}
                  </Text>
                </View>
              </View>
              
              {match.venue && (
                <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
                  📍 {match.venue.name}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const renderStandings = () => (
    <View>
      {standings.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#666' }}>No hay posiciones disponibles</Text>
        </View>
      ) : (
        standings.map((standing, index) => (
          <Card key={standing.id} style={{ marginBottom: 8 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {index + 1}. {standing.team.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {standing.team.club?.name}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>PJ</Text>
                    <Text variant="bodyMedium">{standing.played || 0}</Text>
                  </View>
                  <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>PG</Text>
                    <Text variant="bodyMedium">{standing.wins || 0}</Text>
                  </View>
                  <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>PP</Text>
                    <Text variant="bodyMedium">{standing.losses || 0}</Text>
                  </View>
                  <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>Pts</Text>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                      {standing.points}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const renderTeams = () => (
    <View>
      {teams.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#666' }}>No hay equipos disponibles</Text>
        </View>
      ) : (
        teams.map((team) => (
          <Card key={team.id} style={{ marginBottom: 8 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {team.name}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#666' }}>
                    {team.club?.name}
                  </Text>
                  {team.coach && (
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      DT: {team.coach.name}
                    </Text>
                  )}
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodyMedium">
                    {team.players?.length || 0} jugadoras
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {team.category?.name}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando torneo...</Text>
      </View>
    );
  }

  if (error || !tournament) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#d32f2f', marginBottom: 16, textAlign: 'center' }}>
          {error || 'No se pudo cargar el torneo'}
        </Text>
        <Button mode="outlined" onPress={onRefresh}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Información del Torneo */}
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="headlineSmall" style={{ flex: 1 }}>
              {tournament.name}
            </Text>
            <Chip 
              style={{ backgroundColor: getStatusColor(tournament.status) }}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
            >
              {getStatusText(tournament.status)}
            </Chip>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Información</Text>
            <Text variant="bodyLarge">{tournament.category?.name}</Text>
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              {tournament.league?.name}
            </Text>
            
            {tournament.description && (
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                {tournament.description}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ marginBottom: 4 }}>Inicio</Text>
              <Text variant="bodyMedium">
                {new Date(tournament.start_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ marginBottom: 4 }}>Fin</Text>
              <Text variant="bodyMedium">
                {new Date(tournament.end_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Pestañas */}
        <Surface style={{ margin: 16, borderRadius: 8 }}>
          <View style={{ flexDirection: 'row' }}>
            <Button
              mode={activeTab === 'matches' ? 'contained' : 'text'}
              onPress={() => handleTabChange('matches')}
              style={{ flex: 1, borderRadius: 0 }}
            >
              Partidos
            </Button>
            <Button
              mode={activeTab === 'standings' ? 'contained' : 'text'}
              onPress={() => handleTabChange('standings')}
              style={{ flex: 1, borderRadius: 0 }}
            >
              Posiciones
            </Button>
            <Button
              mode={activeTab === 'teams' ? 'contained' : 'text'}
              onPress={() => handleTabChange('teams')}
              style={{ flex: 1, borderRadius: 0 }}
            >
              Equipos
            </Button>
          </View>
        </Surface>

        {/* Contenido de las pestañas */}
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          {activeTab === 'matches' && renderMatches()}
          {activeTab === 'standings' && renderStandings()}
          {activeTab === 'teams' && renderTeams()}
        </Surface>
      </ScrollView>

      {/* FAB para ver posiciones completas */}
      {activeTab === 'standings' && (
        <FAB
          icon="table"
          label="Ver tabla completa"
          onPress={() => navigation.navigate('Standings', { tournamentId })}
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
          }}
        />
      )}
    </View>
  );
};

export default TournamentDetailScreen;