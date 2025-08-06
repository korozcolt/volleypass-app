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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  number: number;
  status: 'active' | 'injured' | 'suspended' | 'inactive';
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes: string;
  joinDate: string;
  team: string;
}

interface PlayerFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  number: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes: string;
}

const PlayerManagementScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    number: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalNotes: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'injured', label: 'Lesionados' },
    { value: 'suspended', label: 'Suspendidos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const positions = [
    'Atacante',
    'Central',
    'Líbero',
    'Armador',
    'Opuesto',
    'Receptor-Atacante',
  ];

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchQuery, selectedStatus]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPlayers: Player[] = [
        {
          id: '1',
          name: 'Carlos Rodríguez',
          email: 'carlos@email.com',
          phone: '+1234567890',
          position: 'Atacante',
          number: 4,
          status: 'active',
          dateOfBirth: '1995-03-15',
          emergencyContact: 'María Rodríguez',
          emergencyPhone: '+1234567891',
          medicalNotes: 'Alergia a la penicilina',
          joinDate: '2024-01-15',
          team: 'Equipo Juvenil A',
        },
        {
          id: '2',
          name: 'Ana García',
          email: 'ana@email.com',
          phone: '+1234567892',
          position: 'Líbero',
          number: 7,
          status: 'active',
          dateOfBirth: '1997-08-22',
          emergencyContact: 'Pedro García',
          emergencyPhone: '+1234567893',
          medicalNotes: '',
          joinDate: '2024-02-01',
          team: 'Equipo Juvenil A',
        },
        {
          id: '3',
          name: 'Miguel Torres',
          email: 'miguel@email.com',
          phone: '+1234567894',
          position: 'Central',
          number: 12,
          status: 'injured',
          dateOfBirth: '1996-11-10',
          emergencyContact: 'Laura Torres',
          emergencyPhone: '+1234567895',
          medicalNotes: 'Lesión en rodilla derecha',
          joinDate: '2023-09-15',
          team: 'Equipo Senior',
        },
        {
          id: '4',
          name: 'Sofia Martínez',
          email: 'sofia@email.com',
          phone: '+1234567896',
          position: 'Armador',
          number: 1,
          status: 'suspended',
          dateOfBirth: '1998-05-03',
          emergencyContact: 'Juan Martínez',
          emergencyPhone: '+1234567897',
          medicalNotes: '',
          joinDate: '2024-01-20',
          team: 'Equipo Juvenil B',
        },
      ];
      
      setPlayers(mockPlayers);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los jugadores');
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(player => player.status === selectedStatus);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        player =>
          player.name.toLowerCase().includes(query) ||
          player.email.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query) ||
          player.number.toString().includes(query)
      );
    }

    setFilteredPlayers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlayers();
    setRefreshing(false);
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      number: '',
      dateOfBirth: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalNotes: '',
    });
    setShowPlayerModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      email: player.email,
      phone: player.phone,
      position: player.position,
      number: player.number.toString(),
      dateOfBirth: player.dateOfBirth,
      emergencyContact: player.emergencyContact,
      emergencyPhone: player.emergencyPhone,
      medicalNotes: player.medicalNotes,
    });
    setShowPlayerModal(true);
  };

  const handleSavePlayer = () => {
    if (!playerForm.name || !playerForm.email || !playerForm.position || !playerForm.number) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const number = parseInt(playerForm.number);
    if (isNaN(number) || number < 1 || number > 99) {
      Alert.alert('Error', 'El número debe ser entre 1 y 99');
      return;
    }

    // Verificar que el número no esté en uso
    const existingPlayer = players.find(
      p => p.number === number && p.id !== editingPlayer?.id
    );
    if (existingPlayer) {
      Alert.alert('Error', 'Este número ya está en uso');
      return;
    }

    if (editingPlayer) {
      // Editar jugador existente
      const updatedPlayers = players.map(player =>
        player.id === editingPlayer.id
          ? {
              ...player,
              name: playerForm.name,
              email: playerForm.email,
              phone: playerForm.phone,
              position: playerForm.position,
              number,
              dateOfBirth: playerForm.dateOfBirth,
              emergencyContact: playerForm.emergencyContact,
              emergencyPhone: playerForm.emergencyPhone,
              medicalNotes: playerForm.medicalNotes,
            }
          : player
      );
      setPlayers(updatedPlayers);
    } else {
      // Agregar nuevo jugador
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerForm.name,
        email: playerForm.email,
        phone: playerForm.phone,
        position: playerForm.position,
        number,
        status: 'active',
        dateOfBirth: playerForm.dateOfBirth,
        emergencyContact: playerForm.emergencyContact,
        emergencyPhone: playerForm.emergencyPhone,
        medicalNotes: playerForm.medicalNotes,
        joinDate: new Date().toISOString().split('T')[0],
        team: 'Sin asignar',
      };
      setPlayers([...players, newPlayer]);
    }

    setShowPlayerModal(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este jugador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setPlayers(players.filter(p => p.id !== playerId));
          },
        },
      ]
    );
  };

  const handleChangeStatus = (playerId: string, newStatus: Player['status']) => {
    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, status: newStatus } : player
    );
    setPlayers(updatedPlayers);
  };

  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'injured':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
      case 'inactive':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: Player['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'injured':
        return 'Lesionado';
      case 'suspended':
        return 'Suspendido';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerNumber}>
          <Text style={styles.numberText}>{item.number}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerPosition}>{item.position}</Text>
          <Text style={styles.playerTeam}>{item.team}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <View style={styles.playerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditPlayer(item)}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePlayer(item.id)}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.playerDetails}>
        <Text style={styles.detailText}>
          <Ionicons name="mail" size={14} color="#666" /> {item.email}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="call" size={14} color="#666" /> {item.phone}
        </Text>
        {item.emergencyContact && (
          <Text style={styles.detailText}>
            <Ionicons name="person" size={14} color="#666" /> Emergencia: {item.emergencyContact}
          </Text>
        )}
      </View>

      {/* Quick status change */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsLabel}>Estado:</Text>
        <View style={styles.statusButtons}>
          {['active', 'injured', 'suspended', 'inactive'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeStatusButton,
                { borderColor: getStatusColor(status as Player['status']) },
              ]}
              onPress={() => handleChangeStatus(item.id, status as Player['status'])}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  item.status === status && { color: getStatusColor(status as Player['status']) },
                ]}
              >
                {getStatusText(status as Player['status'])}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando jugadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Jugadores</Text>
        
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar jugadores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredPlayers.length}</Text>
          <Text style={styles.statLabel}>Jugadores</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredPlayers.filter(p => p.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredPlayers.filter(p => p.status === 'injured').length}
          </Text>
          <Text style={styles.statLabel}>Lesionados</Text>
        </View>
      </View>

      {/* Add button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Agregar Jugador</Text>
      </TouchableOpacity>

      {/* Players list */}
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.playersList}
      />

      {/* Player Modal */}
      <Modal visible={showPlayerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlayer ? 'Editar Jugador' : 'Agregar Jugador'}
              </Text>
              <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.name}
                  onChangeText={text => setPlayerForm({ ...playerForm, name: text })}
                  placeholder="Nombre completo"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.email}
                  onChangeText={text => setPlayerForm({ ...playerForm, email: text })}
                  placeholder="email@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.phone}
                  onChangeText={text => setPlayerForm({ ...playerForm, phone: text })}
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Posición *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.positionSelector}>
                    {positions.map(position => (
                      <TouchableOpacity
                        key={position}
                        style={[
                          styles.positionButton,
                          playerForm.position === position && styles.selectedPositionButton,
                        ]}
                        onPress={() => setPlayerForm({ ...playerForm, position })}
                      >
                        <Text
                          style={[
                            styles.positionButtonText,
                            playerForm.position === position && styles.selectedPositionButtonText,
                          ]}
                        >
                          {position}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Número *</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.number}
                  onChangeText={text => setPlayerForm({ ...playerForm, number: text })}
                  placeholder="1-99"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.dateOfBirth}
                  onChangeText={text => setPlayerForm({ ...playerForm, dateOfBirth: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contacto de Emergencia</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.emergencyContact}
                  onChangeText={text => setPlayerForm({ ...playerForm, emergencyContact: text })}
                  placeholder="Nombre del contacto"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono de Emergencia</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.emergencyPhone}
                  onChangeText={text => setPlayerForm({ ...playerForm, emergencyPhone: text })}
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notas Médicas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={playerForm.medicalNotes}
                  onChangeText={text => setPlayerForm({ ...playerForm, medicalNotes: text })}
                  placeholder="Alergias, condiciones médicas, etc."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPlayerModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePlayer}>
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
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
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
  playersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerPosition: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  playerTeam: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  playerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  playerDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  quickActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  quickActionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  activeStatusButton: {
    backgroundColor: '#f0f8ff',
  },
  statusButtonText: {
    fontSize: 10,
    color: '#666',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  positionSelector: {
    flexDirection: 'row',
  },
  positionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedPositionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  positionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedPositionButtonText: {
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

export default PlayerManagementScreen;