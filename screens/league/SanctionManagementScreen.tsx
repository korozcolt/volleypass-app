import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Chip,
  Button,
  FAB,
  Searchbar,
  Menu,
  Divider,
  Portal,
  Modal,
  TextInput,
  RadioButton,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
// Removed react-native-vector-icons import - using React Native Paper icons instead

interface Sanction {
  id: string;
  player: {
    id: string;
    name: string;
    jersey_number: number;
  };
  team: {
    id: string;
    name: string;
  };
  type: 'yellow_card' | 'red_card' | 'suspension' | 'fine';
  severity: 'minor' | 'major' | 'severe';
  status: 'active' | 'appealed' | 'reduced' | 'cancelled' | 'expired';
  reason: string;
  applied_at: string;
  expires_at?: string;
  applied_by: string;
  appeal_reason?: string;
  appeal_date?: string;
  match: {
    id: string;
    home_team: string;
    away_team: string;
    date: string;
  };
}

interface SanctionFormData {
  player_id: string;
  team_id: string;
  type: string;
  severity: string;
  reason: string;
  duration_days?: number;
  fine_amount?: number;
}

const SanctionManagementScreen: React.FC = () => {
  const theme = useTheme();
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [filteredSanctions, setFilteredSanctions] = useState<Sanction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSanction, setEditingSanction] = useState<Sanction | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [selectedSanction, setSelectedSanction] = useState<Sanction | null>(null);

  const [sanctionForm, setSanctionForm] = useState<SanctionFormData>({
    player_id: '',
    team_id: '',
    type: 'yellow_card',
    severity: 'minor',
    reason: '',
    duration_days: 7,
    fine_amount: 0,
  });

  const statusOptions = [
    { value: 'all', label: 'Todas', color: theme.colors.outline },
    { value: 'active', label: 'Activas', color: theme.colors.error },
    { value: 'appealed', label: 'Apeladas', color: theme.colors.tertiary },
    { value: 'reduced', label: 'Reducidas', color: theme.colors.primary },
    { value: 'cancelled', label: 'Canceladas', color: theme.colors.outline },
    { value: 'expired', label: 'Expiradas', color: theme.colors.onSurfaceVariant },
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos', icon: 'filter-variant' },
    { value: 'yellow_card', label: 'Tarjeta Amarilla', icon: 'card' },
    { value: 'red_card', label: 'Tarjeta Roja', icon: 'card' },
    { value: 'suspension', label: 'Suspensión', icon: 'account-cancel' },
    { value: 'fine', label: 'Multa', icon: 'currency-usd' },
  ];

  useEffect(() => {
    loadSanctions();
  }, []);

  useEffect(() => {
    filterSanctions();
  }, [sanctions, searchQuery, selectedStatus, selectedType]);

  const loadSanctions = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSanctions: Sanction[] = [
        {
          id: '1',
          player: {
            id: '1',
            name: 'Juan Pérez',
            jersey_number: 10,
          },
          team: {
            id: '1',
            name: 'Equipo Local',
          },
          type: 'yellow_card',
          severity: 'minor',
          status: 'active',
          reason: 'Conducta antideportiva',
          applied_at: '2024-12-15T20:30:00Z',
          expires_at: '2024-12-22T20:30:00Z',
          applied_by: 'Carlos Referee',
          match: {
            id: '1',
            home_team: 'Equipo Local',
            away_team: 'Equipo Visitante',
            date: '2024-12-15',
          },
        },
        {
          id: '2',
          player: {
            id: '2',
            name: 'María García',
            jersey_number: 5,
          },
          team: {
            id: '2',
            name: 'Equipo Visitante',
          },
          type: 'red_card',
          severity: 'major',
          status: 'appealed',
          reason: 'Agresión a otro jugador',
          applied_at: '2024-12-10T19:45:00Z',
          expires_at: '2024-12-24T19:45:00Z',
          applied_by: 'Ana Referee',
          appeal_reason: 'La sanción fue aplicada incorrectamente',
          appeal_date: '2024-12-12T10:00:00Z',
          match: {
            id: '2',
            home_team: 'Tigres Unidos',
            away_team: 'Equipo Visitante',
            date: '2024-12-10',
          },
        },
        {
          id: '3',
          player: {
            id: '3',
            name: 'Carlos López',
            jersey_number: 8,
          },
          team: {
            id: '3',
            name: 'Águilas Doradas',
          },
          type: 'suspension',
          severity: 'severe',
          status: 'reduced',
          reason: 'Acumulación de tarjetas amarillas',
          applied_at: '2024-12-05T18:00:00Z',
          expires_at: '2024-12-19T18:00:00Z',
          applied_by: 'Miguel Torres',
          match: {
            id: '3',
            home_team: 'Águilas Doradas',
            away_team: 'Leones Rojos',
            date: '2024-12-05',
          },
        },
      ];
      
      setSanctions(mockSanctions);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las sanciones');
    } finally {
      setLoading(false);
    }
  };

  const filterSanctions = () => {
    let filtered = sanctions;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sanction => sanction.status === selectedStatus);
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(sanction => sanction.type === selectedType);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        sanction =>
          sanction.player.name.toLowerCase().includes(query) ||
          sanction.team.name.toLowerCase().includes(query) ||
          sanction.reason.toLowerCase().includes(query) ||
          sanction.applied_by.toLowerCase().includes(query)
      );
    }

    setFilteredSanctions(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSanctions();
    setRefreshing(false);
  };

  const handleReduceSanction = (sanction: Sanction) => {
    Alert.alert(
      'Reducir Sanción',
      `¿Estás seguro de que quieres reducir la sanción de ${sanction.player.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reducir',
          onPress: () => {
            const updatedSanctions = sanctions.map(s =>
              s.id === sanction.id ? { ...s, status: 'reduced' } : s
            );
            setSanctions(updatedSanctions);
          },
        },
      ]
    );
  };

  const handleCancelSanction = (sanction: Sanction) => {
    Alert.alert(
      'Cancelar Sanción',
      `¿Estás seguro de que quieres cancelar la sanción de ${sanction.player.name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: () => {
            const updatedSanctions = sanctions.map(s =>
              s.id === sanction.id ? { ...s, status: 'cancelled' } : s
            );
            setSanctions(updatedSanctions);
          },
        },
      ]
    );
  };

  const handleAppealResponse = (accept: boolean) => {
    if (!selectedSanction) return;

    const newStatus = accept ? 'reduced' : 'active';
    const updatedSanctions = sanctions.map(s =>
      s.id === selectedSanction.id ? { ...s, status: newStatus } : s
    );
    setSanctions(updatedSanctions);
    setShowAppealModal(false);
    setSelectedSanction(null);
    setAppealReason('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return theme.colors.tertiary;
      case 'major':
        return theme.colors.error;
      case 'severe':
        return '#8B0000';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || theme.colors.outline;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'yellow_card':
        return 'card';
      case 'red_card':
        return 'card';
      case 'suspension':
        return 'account-cancel';
      case 'fine':
        return 'currency-usd';
      default:
        return 'alert-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSanction = ({ item }: { item: Sanction }) => (
    <Card style={styles.sanctionCard} mode="outlined">
      <Card.Content>
        <View style={styles.sanctionHeader}>
          <View style={styles.playerInfo}>
            <Text variant="titleMedium" style={styles.playerName}>
              {item.player.name} #{item.player.jersey_number}
            </Text>
            <Text variant="bodySmall" style={styles.teamName}>
              {item.team.name}
            </Text>
          </View>
          <View style={styles.sanctionBadges}>
            <Chip
              icon={getTypeIcon(item.type)}
              style={[styles.typeChip, { backgroundColor: getSeverityColor(item.severity) }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.type.replace('_', ' ').toUpperCase()}
            </Chip>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.reason}>
          {item.reason}
        </Text>

        <View style={styles.matchInfo}>
          <Text variant="bodySmall" style={styles.matchText}>
            🏐 {item.match.home_team} vs {item.match.away_team}
          </Text>
        </View>

        <View style={styles.dateInfo}>
          <View style={styles.dateRow}>
            <Text variant="bodySmall" style={styles.dateText}>
              📅 Aplicada: {formatDate(item.applied_at)}
            </Text>
          </View>
          {item.expires_at && (
            <View style={styles.dateRow}>
              <Text variant="bodySmall" style={styles.dateText}>
                ⏰ Expira: {formatDate(item.expires_at)}
              </Text>
            </View>
          )}
        </View>

        <Text variant="bodySmall" style={styles.appliedBy}>
          Aplicada por: {item.applied_by}
        </Text>

        {item.appeal_reason && (
          <Surface style={styles.appealInfo} mode="flat">
            <Text variant="bodySmall" style={styles.appealTitle}>
              Razón de apelación:
            </Text>
            <Text variant="bodySmall" style={styles.appealReason}>
              {item.appeal_reason}
            </Text>
            <Text variant="bodySmall" style={styles.appealDate}>
              Apelada el: {item.appeal_date ? formatDate(item.appeal_date) : 'N/A'}
            </Text>
          </Surface>
        )}
      </Card.Content>

      <Card.Actions>
        {item.status === 'active' && (
          <>
            <Button
              mode="outlined"
              onPress={() => handleReduceSanction(item)}
              icon="arrow-down-circle"
              compact
            >
              Reducir
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleCancelSanction(item)}
              icon="cancel"
              compact
              buttonColor={theme.colors.errorContainer}
            >
              Cancelar
            </Button>
          </>
        )}
        
        {item.status === 'appealed' && (
          <>
            <Button
              mode="contained"
              onPress={() => {
                setSelectedSanction(item);
                setShowAppealModal(true);
              }}
              icon="gavel"
              compact
            >
              Revisar Apelación
            </Button>
          </>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Cargando sanciones...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Gestión de Sanciones" />
        <Menu
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          anchor={
            <Appbar.Action
              icon="filter-variant"
              onPress={() => setShowFilterMenu(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedStatus('all');
              setSelectedType('all');
              setShowFilterMenu(false);
            }}
            title="Limpiar filtros"
            leadingIcon="filter-remove"
          />
          <Divider />
          {statusOptions.map(option => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setSelectedStatus(option.value);
                setShowFilterMenu(false);
              }}
              title={option.label}
              leadingIcon={selectedStatus === option.value ? 'check' : undefined}
            />
          ))}
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar sanciones..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {statusOptions.map(option => (
          <Chip
            key={option.value}
            selected={selectedStatus === option.value}
            onPress={() => setSelectedStatus(option.value)}
            style={styles.filterChip}
            showSelectedOverlay
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFiltersContainer}>
        {typeOptions.map(option => (
          <Chip
            key={option.value}
            selected={selectedType === option.value}
            onPress={() => setSelectedType(option.value)}
            style={styles.filterChip}
            icon={option.icon}
            showSelectedOverlay
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredSanctions}
        renderItem={renderSanction}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sanctionsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon, { color: theme.colors.onSurfaceVariant }]}>
              🛡️
            </Text>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No hay sanciones
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              No se encontraron sanciones con los filtros aplicados
            </Text>
          </View>
        }
      />

      {/* Appeal Review Modal */}
      <Portal>
        <Modal
          visible={showAppealModal}
          onDismiss={() => setShowAppealModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Revisar Apelación
          </Text>
          
          {selectedSanction && (
            <>
              <Text variant="bodyLarge" style={styles.modalPlayerName}>
                {selectedSanction.player.name} #{selectedSanction.player.jersey_number}
              </Text>
              
              <Text variant="bodyMedium" style={styles.modalSectionTitle}>
                Sanción Original:
              </Text>
              <Text variant="bodyMedium" style={styles.modalText}>
                {selectedSanction.reason}
              </Text>
              
              <Text variant="bodyMedium" style={styles.modalSectionTitle}>
                Razón de Apelación:
              </Text>
              <Text variant="bodyMedium" style={styles.modalText}>
                {selectedSanction.appeal_reason}
              </Text>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleAppealResponse(false)}
                  style={styles.modalButton}
                >
                  Rechazar Apelación
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleAppealResponse(true)}
                  style={styles.modalButton}
                >
                  Aceptar Apelación
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowModal(true)}
        label="Nueva Sanción"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  sanctionsList: {
    padding: 16,
  },
  sanctionCard: {
    marginBottom: 12,
  },
  sanctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
  },
  teamName: {
    opacity: 0.7,
    marginTop: 2,
  },
  sanctionBadges: {
    alignItems: 'flex-end',
  },
  typeChip: {
    marginBottom: 4,
  },
  statusChip: {
    marginBottom: 4,
  },
  reason: {
    marginBottom: 12,
    fontStyle: 'italic',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchText: {
    opacity: 0.7,
  },
  dateInfo: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    opacity: 0.7,
  },
  appliedBy: {
    opacity: 0.7,
    marginBottom: 8,
  },
  appealInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  appealTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appealReason: {
    marginBottom: 4,
    fontStyle: 'italic',
  },
  appealDate: {
    opacity: 0.7,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    opacity: 0.7,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPlayerName: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  modalText: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default SanctionManagementScreen;