import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  referee?: string;
  category: string;
  round: string;
  tournament: string;
}

interface MatchFormData {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  referee: string;
  category: string;
  round: string;
  tournament: string;
}

const LeagueMatchesScreen: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [matchForm, setMatchForm] = useState<MatchFormData>({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: '',
    referee: '',
    category: '',
    round: '',
    tournament: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'scheduled', label: 'Programados' },
    { value: 'live', label: 'En Vivo' },
    { value: 'finished', label: 'Finalizados' },
    { value: 'postponed', label: 'Pospuestos' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'Primera División', label: 'Primera División' },
    { value: 'Sub-18', label: 'Sub-18' },
    { value: 'Sub-16', label: 'Sub-16' },
    { value: 'Femenino', label: 'Femenino' },
  ];

  const teams = [
    'Equipo Juvenil A',
    'Equipo Juvenil B',
    'Equipo Senior',
    'Volcanes FC',
    'Águilas Doradas',
    'Tigres Unidos',
    'Leones Rojos',
    'Halcones Azules',
  ];

  const venues = [
    'Polideportivo Central',
    'Gimnasio Municipal',
    'Centro Deportivo Norte',
    'Complejo Deportivo Sur',
    'Cancha Universitaria',
  ];

  const referees = [
    'Carlos Mendoza',
    'Ana Rodríguez',
    'Miguel Torres',
    'Sofia Martínez',
    'Pedro García',
  ];

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchQuery, selectedStatus, selectedCategory]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMatches: Match[] = [
        {
          id: '1',
          homeTeam: 'Equipo Juvenil A',
          awayTeam: 'Volcanes FC',
          date: '2024-12-20',
          time: '18:00',
          venue: 'Polideportivo Central',
          status: 'scheduled',
          referee: 'Carlos Mendoza',
          category: 'Sub-18',
          round: 'Jornada 15',
          tournament: 'Liga Regional 2024',
        },
        {
          id: '2',
          homeTeam: 'Águilas Doradas',
          awayTeam: 'Equipo Senior',
          date: '2024-12-18',
          time: '20:00',
          venue: 'Gimnasio Municipal',
          status: 'live',
          homeScore: 2,
          awayScore: 1,
          referee: 'Ana Rodríguez',
          category: 'Primera División',
          round: 'Jornada 12',
          tournament: 'Liga Nacional 2024',
        },
        {
          id: '3',
          homeTeam: 'Tigres Unidos',
          awayTeam: 'Leones Rojos',
          date: '2024-12-15',
          time: '16:00',
          venue: 'Centro Deportivo Norte',
          status: 'finished',
          homeScore: 3,
          awayScore: 2,
          referee: 'Miguel Torres',
          category: 'Primera División',
          round: 'Jornada 11',
          tournament: 'Liga Nacional 2024',
        },
        {
          id: '4',
          homeTeam: 'Halcones Azules',
          awayTeam: 'Equipo Juvenil B',
          date: '2024-12-22',
          time: '14:00',
          venue: 'Complejo Deportivo Sur',
          status: 'postponed',
          referee: 'Sofia Martínez',
          category: 'Sub-16',
          round: 'Jornada 8',
          tournament: 'Copa Juvenil 2024',
        },
      ];
      
      setMatches(mockMatches);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(match => match.status === selectedStatus);
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(match => match.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        match =>
          match.homeTeam.toLowerCase().includes(query) ||
          match.awayTeam.toLowerCase().includes(query) ||
          match.venue.toLowerCase().includes(query) ||
          match.referee?.toLowerCase().includes(query) ||
          match.tournament.toLowerCase().includes(query)
      );
    }

    setFilteredMatches(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleAddMatch = () => {
    setEditingMatch(null);
    setMatchForm({
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      venue: '',
      referee: '',
      category: '',
      round: '',
      tournament: '',
    });
    setShowMatchModal(true);
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchForm({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: match.date,
      time: match.time,
      venue: match.venue,
      referee: match.referee || '',
      category: match.category,
      round: match.round,
      tournament: match.tournament,
    });
    setShowMatchModal(true);
  };

  const handleSaveMatch = () => {
    if (!matchForm.homeTeam || !matchForm.awayTeam || !matchForm.date || !matchForm.time || !matchForm.venue) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (matchForm.homeTeam === matchForm.awayTeam) {
      Alert.alert('Error', 'Los equipos local y visitante deben ser diferentes');
      return;
    }

    if (editingMatch) {
      // Editar partido existente
      const updatedMatches = matches.map(match =>
        match.id === editingMatch.id
          ? {
              ...match,
              homeTeam: matchForm.homeTeam,
              awayTeam: matchForm.awayTeam,
              date: matchForm.date,
              time: matchForm.time,
              venue: matchForm.venue,
              referee: matchForm.referee,
              category: matchForm.category,
              round: matchForm.round,
              tournament: matchForm.tournament,
            }
          : match
      );
      setMatches(updatedMatches);
    } else {
      // Agregar nuevo partido
      const newMatch: Match = {
        id: Date.now().toString(),
        homeTeam: matchForm.homeTeam,
        awayTeam: matchForm.awayTeam,
        date: matchForm.date,
        time: matchForm.time,
        venue: matchForm.venue,
        status: 'scheduled',
        referee: matchForm.referee,
        category: matchForm.category,
        round: matchForm.round,
        tournament: matchForm.tournament,
      };
      setMatches([...matches, newMatch]);
    }

    setShowMatchModal(false);
  };

  const handleDeleteMatch = (matchId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este partido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setMatches(matches.filter(m => m.id !== matchId));
          },
        },
      ]
    );
  };

  const handleChangeStatus = (matchId: string, newStatus: Match['status']) => {
    const updatedMatches = matches.map(match =>
      match.id === matchId ? { ...match, status: newStatus } : match
    );
    setMatches(updatedMatches);
  };

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'scheduled':
        return '#2196F3';
      case 'live':
        return '#4CAF50';
      case 'finished':
        return '#757575';
      case 'postponed':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: Match['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'live':
        return 'En Vivo';
      case 'finished':
        return 'Finalizado';
      case 'postponed':
        return 'Pospuesto';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.tournament}>{item.tournament}</Text>
          <Text style={styles.round}>{item.round}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditMatch(item)}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteMatch(item.id)}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.homeTeam}</Text>
          <Text style={styles.teamLabel}>Local</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          {item.status === 'live' || item.status === 'finished' ? (
            <View style={styles.score}>
              <Text style={styles.scoreText}>
                {item.homeScore} - {item.awayScore}
              </Text>
            </View>
          ) : (
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
          )}
        </View>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.awayTeam}</Text>
          <Text style={styles.teamLabel}>Visitante</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.date)} • {item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{item.venue}</Text>
        </View>
        {item.referee && (
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>Árbitro: {item.referee}</Text>
          </View>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        
        {item.status === 'scheduled' && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleChangeStatus(item.id, 'live')}
            >
              <Text style={styles.quickActionText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
              onPress={() => handleChangeStatus(item.id, 'postponed')}
            >
              <Text style={styles.quickActionText}>Posponer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'live' && (
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#757575' }]}
            onPress={() => handleChangeStatus(item.id, 'finished')}
          >
            <Text style={styles.quickActionText}>Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando partidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Partidos</Text>
        
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar partidos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Estado:</Text>
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterButton,
                  selectedStatus === option.value && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedStatus(option.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedStatus === option.value && styles.activeFilterButtonText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Categoría:</Text>
            {categoryOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterButton,
                  selectedCategory === option.value && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedCategory(option.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === option.value && styles.activeFilterButtonText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredMatches.length}</Text>
          <Text style={styles.statLabel}>Partidos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredMatches.filter(m => m.status === 'live').length}
          </Text>
          <Text style={styles.statLabel}>En Vivo</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredMatches.filter(m => m.status === 'scheduled').length}
          </Text>
          <Text style={styles.statLabel}>Programados</Text>
        </View>
      </View>

      {/* Add button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddMatch}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Programar Partido</Text>
      </TouchableOpacity>

      {/* Matches list */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.matchesList}
      />

      {/* Match Modal */}
      <Modal visible={showMatchModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMatch ? 'Editar Partido' : 'Programar Partido'}
              </Text>
              <TouchableOpacity onPress={() => setShowMatchModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Equipo Local *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.teamSelector}>
                    {teams.map(team => (
                      <TouchableOpacity
                        key={team}
                        style={[
                          styles.teamButton,
                          matchForm.homeTeam === team && styles.selectedTeamButton,
                        ]}
                        onPress={() => setMatchForm({ ...matchForm, homeTeam: team })}
                      >
                        <Text
                          style={[
                            styles.teamButtonText,
                            matchForm.homeTeam === team && styles.selectedTeamButtonText,
                          ]}
                        >
                          {team}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Equipo Visitante *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.teamSelector}>
                    {teams.map(team => (
                      <TouchableOpacity
                        key={team}
                        style={[
                          styles.teamButton,
                          matchForm.awayTeam === team && styles.selectedTeamButton,
                        ]}
                        onPress={() => setMatchForm({ ...matchForm, awayTeam: team })}
                      >
                        <Text
                          style={[
                            styles.teamButtonText,
                            matchForm.awayTeam === team && styles.selectedTeamButtonText,
                          ]}
                        >
                          {team}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Fecha *</Text>
                  <TextInput
                    style={styles.input}
                    value={matchForm.date}
                    onChangeText={text => setMatchForm({ ...matchForm, date: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Hora *</Text>
                  <TextInput
                    style={styles.input}
                    value={matchForm.time}
                    onChangeText={text => setMatchForm({ ...matchForm, time: text })}
                    placeholder="HH:MM"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Sede *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.venueSelector}>
                    {venues.map(venue => (
                      <TouchableOpacity
                        key={venue}
                        style={[
                          styles.venueButton,
                          matchForm.venue === venue && styles.selectedVenueButton,
                        ]}
                        onPress={() => setMatchForm({ ...matchForm, venue })}
                      >
                        <Text
                          style={[
                            styles.venueButtonText,
                            matchForm.venue === venue && styles.selectedVenueButtonText,
                          ]}
                        >
                          {venue}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Árbitro</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.refereeSelector}>
                    {referees.map(referee => (
                      <TouchableOpacity
                        key={referee}
                        style={[
                          styles.refereeButton,
                          matchForm.referee === referee && styles.selectedRefereeButton,
                        ]}
                        onPress={() => setMatchForm({ ...matchForm, referee })}
                      >
                        <Text
                          style={[
                            styles.refereeButtonText,
                            matchForm.referee === referee && styles.selectedRefereeButtonText,
                          ]}
                        >
                          {referee}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Categoría</Text>
                  <TextInput
                    style={styles.input}
                    value={matchForm.category}
                    onChangeText={text => setMatchForm({ ...matchForm, category: text })}
                    placeholder="Ej: Primera División"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Jornada</Text>
                  <TextInput
                    style={styles.input}
                    value={matchForm.round}
                    onChangeText={text => setMatchForm({ ...matchForm, round: text })}
                    placeholder="Ej: Jornada 15"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Torneo</Text>
                <TextInput
                  style={styles.input}
                  value={matchForm.tournament}
                  onChangeText={text => setMatchForm({ ...matchForm, tournament: text })}
                  placeholder="Ej: Liga Regional 2024"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowMatchModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveMatch}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
    color: '#666',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  matchesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  matchInfo: {
    flex: 1,
  },
  tournament: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  round: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  matchActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  scoreContainer: {
    marginHorizontal: 20,
  },
  score: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vsContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  matchDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  teamSelector: {
    flexDirection: 'row',
  },
  teamButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedTeamButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  teamButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTeamButtonText: {
    color: 'white',
  },
  venueSelector: {
    flexDirection: 'row',
  },
  venueButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedVenueButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  venueButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedVenueButtonText: {
    color: 'white',
  },
  refereeSelector: {
    flexDirection: 'row',
  },
  refereeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedRefereeButton: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  refereeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedRefereeButtonText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LeagueMatchesScreen;