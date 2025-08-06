import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  ActivityIndicator,
  Surface,
  Button,
  Searchbar,
  useTheme,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { Tournament, TournamentFilters } from '../../types';

const TournamentsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    filterTournaments();
  }, [tournaments, searchQuery, selectedStatus]);

  const loadTournaments = async () => {
    try {
      setError(null);
      const filters: TournamentFilters = {
        per_page: 50,
        sort_by: 'start_date'
      };
      
      const response = await api.getTournaments(filters);
      
      if (response.success) {
        setTournaments(response.data.data);
        
        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Set(response.data.data.flatMap(t => t.category ? [{id: t.category.id, name: t.category.name}] : []))
        );
        setCategories(uniqueCategories);
      } else {
        setError('Error al cargar los torneos');
      }
    } catch (error) {
      console.error('Error cargando torneos:', error);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  const filterTournaments = () => {
    let filtered = tournaments;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === selectedStatus);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tournament => 
        tournament.name.toLowerCase().includes(query) ||
        tournament.category.name.toLowerCase().includes(query) ||
        tournament.league.name.toLowerCase().includes(query)
      );
    }

    setFilteredTournaments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'upcoming':
        return '#0088ff';
      case 'finished':
        return '#00aa00';
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'upcoming':
        return 'Próximo';
      case 'finished':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderTournamentCard = (tournament: Tournament) => (
    <Card
      key={tournament.id}
      style={{ marginBottom: 12 }}
      onPress={() => navigation.navigate('TournamentDetail' as never, { tournamentId: tournament.id } as never)}
    >
      <Card.Content style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
              {tournament.name}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
              {tournament.category.name} • {tournament.league.name}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(tournament.status) }}
            textStyle={{ color: 'white', fontSize: 10 }}
          >
            {getStatusText(tournament.status)}
          </Chip>
        </View>

        {/* Fechas */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon
            name="calendar"
            size={16}
            color={theme.colors.onSurfaceVariant}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
            {formatDate(tournament.start_date)}
            {tournament.end_date && ` - ${formatDate(tournament.end_date)}`}
          </Text>
        </View>

        {/* Descripción */}
        {tournament.description && (
          <Text
            style={{ 
              color: theme.colors.onSurfaceVariant, 
              fontSize: 12, 
              lineHeight: 16,
              marginBottom: 8
            }}
            numberOfLines={2}
          >
            {tournament.description}
          </Text>
        )}

        {/* Estadísticas */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="account-group"
                size={14}
                color={theme.colors.onSurfaceVariant}
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {tournament.teams?.length || 0} equipos
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="volleyball"
                size={14}
                color={theme.colors.onSurfaceVariant}
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {tournament.matches?.length || 0} partidos
              </Text>
            </View>
          </View>
          
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando torneos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header con búsqueda y filtros */}
        <Surface style={{ padding: 16, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon
              name="trophy"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <Title style={{ flex: 1 }}>Torneos</Title>
            
            <Menu
              visible={filterMenuVisible}
              onDismiss={() => setFilterMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setFilterMenuVisible(true)}
                  icon="filter"
                  compact
                >
                  Filtrar
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSelectedStatus('all');
                  setFilterMenuVisible(false);
                }}
                title="Todos"
                leadingIcon={selectedStatus === 'all' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSelectedStatus('active');
                  setFilterMenuVisible(false);
                }}
                title="Activos"
                leadingIcon={selectedStatus === 'active' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSelectedStatus('upcoming');
                  setFilterMenuVisible(false);
                }}
                title="Próximos"
                leadingIcon={selectedStatus === 'upcoming' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSelectedStatus('finished');
                  setFilterMenuVisible(false);
                }}
                title="Finalizados"
                leadingIcon={selectedStatus === 'finished' ? 'check' : undefined}
              />
            </Menu>
          </View>
          
          <Searchbar
            placeholder="Buscar torneos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 0 }}
          />
        </Surface>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Error */}
          {error && (
            <Surface
              style={{
                backgroundColor: theme.colors.errorContainer,
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="alert-circle"
                  size={20}
                  color={theme.colors.onErrorContainer}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: theme.colors.onErrorContainer, flex: 1 }}>
                  {error}
                </Text>
              </View>
              <Button
                mode="text"
                onPress={loadTournaments}
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
                textColor={theme.colors.onErrorContainer}
              >
                Reintentar
              </Button>
            </Surface>
          )}

          {/* Estadísticas rápidas */}
          {tournaments.length > 0 && (
            <Surface
              style={{
                padding: 16,
                marginBottom: 16,
                borderRadius: 12,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.primary }}>
                    {tournaments.filter(t => t.status === 'active').length}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Activos
                  </Text>
                </View>
                
                <Divider style={{ width: 1, height: '100%' }} />
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.primary }}>
                    {tournaments.filter(t => t.status === 'upcoming').length}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Próximos
                  </Text>
                </View>
                
                <Divider style={{ width: 1, height: '100%' }} />
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.primary }}>
                    {tournaments.length}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                    Total
                  </Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Lista de torneos */}
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map(renderTournamentCard)
          ) : (
            <Card>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Icon
                  name={searchQuery || selectedStatus !== 'all' ? 'magnify' : 'trophy-outline'}
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                  style={{ marginBottom: 16 }}
                />
                <Title style={{ textAlign: 'center', marginBottom: 8 }}>
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'No se encontraron torneos'
                    : 'No hay torneos disponibles'
                  }
                </Title>
                <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  {searchQuery || selectedStatus !== 'all'
                    ? 'Intenta con otros términos de búsqueda o filtros'
                    : 'Actualmente no hay torneos programados'
                  }
                </Text>
                {(searchQuery || selectedStatus !== 'all') && (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                    }}
                    style={{ marginTop: 16 }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TournamentsScreen;