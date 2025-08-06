import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  DataTable,
  Searchbar,
  Chip,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import api from '../../services/api';
import { Standing, Tournament } from '../../types';

interface StandingsScreenProps {
  navigation: any;
  route?: {
    params?: {
      tournamentId?: string;
    };
  };
}

const StandingsScreen: React.FC<StandingsScreenProps> = ({ navigation, route }) => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    route?.params?.tournamentId || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const loadTournaments = async () => {
    try {
      const response = await api.getTournaments({ status: 'active' });
      setTournaments(response.data);
      
      if (!selectedTournament && response.data.length > 0) {
        setSelectedTournament(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading tournaments:', err);
      setError('Error al cargar los torneos');
    }
  };

  const loadStandings = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await api.getTournamentStandings(tournamentId);
      setStandings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading standings:', err);
      setError('Error al cargar las posiciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    if (selectedTournament) {
      await loadStandings(selectedTournament);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadStandings(selectedTournament);
    }
  }, [selectedTournament]);

  const filteredStandings = standings.filter(standing =>
    standing.team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTournamentData = tournaments.find(t => t.id === selectedTournament);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando posiciones...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          Tabla de Posiciones
        </Text>

        {/* Selector de Categoría */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Categoría:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {Array.from(new Set(tournaments.flatMap(t => t.categories?.map(cat => cat.name) || []))).map((categoryName) => {
            const categoryId = tournaments.find(t => t.categories?.some(cat => cat.name === categoryName))?.categories?.find(cat => cat.name === categoryName)?.id;
            return (
              <Chip
                key={categoryName}
                style={{ marginRight: 8 }}
                selected={selectedCategory === categoryId}
                onPress={() => {
                  setSelectedCategory(
                    selectedCategory === categoryId ? null : categoryId
                  );
                }}
              >
                {categoryName}
              </Chip>
            );
          })}
        </ScrollView>

        {/* Selector de Torneo */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Torneo:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {tournaments.filter(t => selectedCategory === null || t.categories?.some(cat => cat.id === selectedCategory)).map((tournament) => (
            <Chip
              key={tournament.id}
              selected={selectedTournament === tournament.id}
              onPress={() => {
                if (selectedTournament !== tournament.id) {
                  setSelectedTournament(tournament.id);
                  loadStandings(tournament.id);
                }
              }}
              style={{ marginRight: 8 }}
            >
              {tournament.name}
            </Chip>
          ))}
        </ScrollView>

        {selectedTournamentData && (
          <Surface style={{ padding: 12, marginBottom: 16, backgroundColor: '#e3f2fd' }}>
            <Text variant="titleMedium">{selectedTournamentData.name}</Text>
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              {selectedTournamentData.category?.name} • {selectedTournamentData.league?.name}
            </Text>
          </Surface>
        )}

        {/* Buscador */}
        <Searchbar
          placeholder="Buscar equipo..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {error ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#d32f2f', marginBottom: 16 }}>{error}</Text>
            <Button mode="outlined" onPress={onRefresh}>
              Reintentar
            </Button>
          </View>
        ) : filteredStandings.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#666' }}>
              {searchQuery ? 'No se encontraron equipos' : 'No hay posiciones disponibles'}
            </Text>
          </View>
        ) : (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 2 }}>Equipo</DataTable.Title>
              <DataTable.Title numeric>PJ</DataTable.Title>
              <DataTable.Title numeric>PG</DataTable.Title>
              <DataTable.Title numeric>PP</DataTable.Title>
              <DataTable.Title numeric>Pts</DataTable.Title>
            </DataTable.Header>

            {filteredStandings.map((standing, index) => (
              <DataTable.Row key={standing.team.id}>
                <DataTable.Cell style={{ flex: 2 }}>
                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {index + 1}. {standing.team.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      {standing.team.club?.name}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell numeric>{standing.matches_played}</DataTable.Cell>
                <DataTable.Cell numeric>{standing.wins}</DataTable.Cell>
                <DataTable.Cell numeric>{standing.losses}</DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text style={{ fontWeight: 'bold' }}>{standing.points}</Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        )}
      </Surface>
    </ScrollView>
  );
};

export default StandingsScreen;