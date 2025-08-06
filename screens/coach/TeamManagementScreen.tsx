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

interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  status: 'active' | 'injured' | 'suspended';
  email: string;
  phone: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
  players: Player[];
  coach: string;
  season: string;
}

const TeamManagementScreen: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: '',
    number: '',
    email: '',
    phone: '',
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    category: '',
    season: '',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Equipo Juvenil A',
          category: 'Sub-18',
          coach: 'Juan Pérez',
          season: '2024',
          players: [
            {
              id: '1',
              name: 'Carlos Rodríguez',
              position: 'Atacante',
              number: 4,
              status: 'active',
              email: 'carlos@email.com',
              phone: '+1234567890',
            },
            {
              id: '2',
              name: 'Ana García',
              position: 'Líbero',
              number: 7,
              status: 'active',
              email: 'ana@email.com',
              phone: '+1234567891',
            },
          ],
        },
        {
          id: '2',
          name: 'Equipo Senior',
          category: 'Primera División',
          coach: 'Juan Pérez',
          season: '2024',
          players: [
            {
              id: '3',
              name: 'Miguel Torres',
              position: 'Central',
              number: 12,
              status: 'injured',
              email: 'miguel@email.com',
              phone: '+1234567892',
            },
          ],
        },
      ];
      
      setTeams(mockTeams);
      if (mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      position: '',
      number: '',
      email: '',
      phone: '',
    });
    setShowPlayerModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      position: player.position,
      number: player.number.toString(),
      email: player.email,
      phone: player.phone,
    });
    setShowPlayerModal(true);
  };

  const handleSavePlayer = () => {
    if (!selectedTeam) return;
    
    if (!playerForm.name || !playerForm.position || !playerForm.number) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const number = parseInt(playerForm.number);
    if (isNaN(number) || number < 1 || number > 99) {
      Alert.alert('Error', 'El número debe ser entre 1 y 99');
      return;
    }

    // Verificar que el número no esté en uso
    const existingPlayer = selectedTeam.players.find(
      p => p.number === number && p.id !== editingPlayer?.id
    );
    if (existingPlayer) {
      Alert.alert('Error', 'Este número ya está en uso');
      return;
    }

    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeam.id) {
        let updatedPlayers;
        if (editingPlayer) {
          // Editar jugador existente
          updatedPlayers = team.players.map(player =>
            player.id === editingPlayer.id
              ? {
                  ...player,
                  name: playerForm.name,
                  position: playerForm.position,
                  number,
                  email: playerForm.email,
                  phone: playerForm.phone,
                }
              : player
          );
        } else {
          // Agregar nuevo jugador
          const newPlayer: Player = {
            id: Date.now().toString(),
            name: playerForm.name,
            position: playerForm.position,
            number,
            status: 'active',
            email: playerForm.email,
            phone: playerForm.phone,
          };
          updatedPlayers = [...team.players, newPlayer];
        }
        return { ...team, players: updatedPlayers };
      }
      return team;
    });

    setTeams(updatedTeams);
    setSelectedTeam(updatedTeams.find(t => t.id === selectedTeam.id) || null);
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
            if (!selectedTeam) return;
            
            const updatedTeams = teams.map(team => {
              if (team.id === selectedTeam.id) {
                return {
                  ...team,
                  players: team.players.filter(p => p.id !== playerId),
                };
              }
              return team;
            });
            
            setTeams(updatedTeams);
            setSelectedTeam(updatedTeams.find(t => t.id === selectedTeam.id) || null);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'injured':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
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
      {(item.email || item.phone) && (
        <View style={styles.playerContact}>
          {item.email && (
            <Text style={styles.contactText}>
              <Ionicons name="mail" size={14} color="#666" /> {item.email}
            </Text>
          )}
          {item.phone && (
            <Text style={styles.contactText}>
              <Ionicons name="call" size={14} color="#666" /> {item.phone}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con selector de equipo */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Equipos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamSelector}>
          {teams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamTab,
                selectedTeam?.id === team.id && styles.selectedTeamTab,
              ]}
              onPress={() => setSelectedTeam(team)}
            >
              <Text
                style={[
                  styles.teamTabText,
                  selectedTeam?.id === team.id && styles.selectedTeamTabText,
                ]}
              >
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedTeam && (
        <View style={styles.content}>
          {/* Info del equipo */}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{selectedTeam.name}</Text>
            <Text style={styles.teamDetails}>
              {selectedTeam.category} • {selectedTeam.season} • {selectedTeam.players.length} jugadores
            </Text>
          </View>

          {/* Botón agregar jugador */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Agregar Jugador</Text>
          </TouchableOpacity>

          {/* Lista de jugadores */}
          <FlatList
            data={selectedTeam.players}
            renderItem={renderPlayer}
            keyExtractor={item => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.playersList}
          />
        </View>
      )}

      {/* Modal para agregar/editar jugador */}
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
                <Text style={styles.label}>Posición *</Text>
                <TextInput
                  style={styles.input}
                  value={playerForm.position}
                  onChangeText={text => setPlayerForm({ ...playerForm, position: text })}
                  placeholder="Ej: Atacante, Líbero, Central"
                />
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
                <Text style={styles.label}>Email</Text>
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
  teamSelector: {
    flexDirection: 'row',
  },
  teamTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedTeamTab: {
    backgroundColor: '#2196F3',
  },
  teamTabText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedTeamTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  teamInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  teamDetails: {
    color: '#666',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playersList: {
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
  playerContact: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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

export default TeamManagementScreen;