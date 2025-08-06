import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Surface,
  Chip,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
  useTheme,
  Divider,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { VolleyPassAPI } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { Match, Rotation, RotationPosition } from '../../types';
import { useAuth } from '../../providers/AuthProvider';

interface RouteParams {
  matchId: number;
}

interface ScoreDialogState {
  visible: boolean;
  team: 'home' | 'away';
  action: 'add' | 'subtract';
}

interface SetDialogState {
  visible: boolean;
  homeScore: string;
  awayScore: string;
}

const MatchControlScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const [rotation, setRotation] = useState<Rotation | null>(null);
  const [availablePositions, setAvailablePositions] = useState<RotationPosition[]>([]);
  const [scoreDialog, setScoreDialog] = useState<ScoreDialogState>({
    visible: false,
    team: 'home',
    action: 'add'
  });
  const [setDialog, setSetDialog] = useState<SetDialogState>({
    visible: false,
    homeScore: '',
    awayScore: ''
  });
  const [updating, setUpdating] = useState(false);
  
  const api = new VolleyPassAPI();
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    loadMatchData();
    setupWebSocket();
    
    return () => {
      cleanupWebSocket();
    };
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del partido
      const matchResponse = await api.getMatch(matchId);
      setMatch(matchResponse);
      
      // Cargar rotación actual
      try {
        const rotationResponse = await api.getCurrentRotation(matchId);
        setRotation(rotationResponse);
      } catch (rotationError) {
        console.log('No rotation available yet');
      }
      
      // Cargar posiciones disponibles
      try {
        const positionsResponse = await api.getAvailablePositions();
        setAvailablePositions(positionsResponse);
      } catch (positionError) {
        console.log('No positions available yet');
      }
    } catch (error) {
      console.error('Error cargando datos del partido:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del partido');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    wsService.current = webSocketService;
    
    // Suscribirse a actualizaciones del partido
    wsService.current.subscribeToMatch(matchId, (update: any) => {
      if (match) {
        setMatch(prev => prev ? {
          ...prev,
          home_sets: update.home_sets,
          away_sets: update.away_sets,
          current_set: update.current_set,
          status: update.status,
          sets: update.sets || prev.sets,
        } : null);
      }
    });
  };

  const cleanupWebSocket = () => {
    if (wsService.current) {
      wsService.current.unsubscribeFromMatch(matchId);
      wsService.current.disconnect();
      wsService.current = null;
    }
  };

  const updateScore = async (team: 'home' | 'away', action: 'add' | 'subtract') => {
    if (!match) return;
    
    try {
      setUpdating(true);
      
      const currentScore = team === 'home' ? match.home_sets || 0 : match.away_sets || 0;
      const newScore = action === 'add' ? currentScore + 1 : Math.max(0, currentScore - 1);
      
      // Actualizar el marcador a través de la API
      await api.updateMatchScore(matchId, { [team + '_sets']: newScore });
      
      // Actualizar localmente
      setMatch(prev => prev ? {
        ...prev,
        [team + '_sets']: newScore
      } : null);
      
    } catch (error) {
      console.error('Error actualizando marcador:', error);
      Alert.alert('Error', 'No se pudo actualizar el marcador');
    } finally {
      setUpdating(false);
    }
  };

  const startMatch = async () => {
    try {
      setUpdating(true);
      
      // Llamada a la API para iniciar el partido
      await api.startMatch(matchId);
      
      setMatch(prev => prev ? { ...prev, status: 'in_progress' as const } : null);
      
      Alert.alert('Éxito', 'Partido iniciado correctamente');
    } catch (error) {
      console.error('Error iniciando partido:', error);
      Alert.alert('Error', 'No se pudo iniciar el partido');
    } finally {
      setUpdating(false);
    }
  };

  const finishSet = () => {
    if (!match) return;
    
    setSetDialog({
      visible: true,
      homeScore: (match.home_sets || 0).toString(),
      awayScore: (match.away_sets || 0).toString()
    });
  };

  const confirmFinishSet = async () => {
    try {
      setUpdating(true);
      
      const homeScore = parseInt(setDialog.homeScore);
      const awayScore = parseInt(setDialog.awayScore);
      
      // Llamada a la API para finalizar el set
      await api.finishSet(matchId, { home_score: homeScore, away_score: awayScore });
      
      // Actualizar localmente
      if (match) {
        const newSet = {
          set_number: (match.current_set || 1),
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed' as const
        };
        
        setMatch(prev => prev ? {
          ...prev,
          sets: [...(prev.sets || []), newSet],
          current_set: (prev.current_set || 1) + 1,
          home_sets: 0,
          away_sets: 0
        } : null);
      }
      
      setSetDialog({ visible: false, homeScore: '', awayScore: '' });
      Alert.alert('Éxito', 'Set finalizado correctamente');
    } catch (error) {
      console.error('Error finalizando set:', error);
      Alert.alert('Error', 'No se pudo finalizar el set');
    } finally {
      setUpdating(false);
    }
  };

  const finishMatch = async () => {
    Alert.alert(
      'Finalizar Partido',
      '¿Estás seguro de que quieres finalizar este partido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              
              // Llamada a la API para finalizar el partido
              await api.finishMatch(matchId);
              
              setMatch(prev => prev ? { ...prev, status: 'completed' as const } : null);
              
              Alert.alert('Éxito', 'Partido finalizado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error finalizando partido:', error);
              Alert.alert('Error', 'No se pudo finalizar el partido');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#ff4444';
      case 'scheduled': return '#0088ff';
      case 'completed': return '#00aa00';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'EN VIVO';
      case 'scheduled': return 'PROGRAMADO';
      case 'completed': return 'FINALIZADO';
      default: return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando control del partido...</Text>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={{ marginTop: 16, textAlign: 'center' }}>No se pudo cargar el partido</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          Volver
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header del partido */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                  {match.tournament.name}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                  {match.venue?.name || 'Sede por confirmar'}
                </Text>
              </View>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(match.status) }}
                textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
              >
                {getStatusText(match.status)}
              </Chip>
            </View>
            
            <Title style={{ textAlign: 'center', marginBottom: 8 }}>
              {match.home_team.name} vs {match.away_team.name}
            </Title>
            
            {match.current_set && (
              <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                Set {match.current_set}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Marcador */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 20 }}>
            <Title style={{ textAlign: 'center', marginBottom: 20 }}>Marcador</Title>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Equipo local */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                  {match.home_team.name}
                </Text>
                <Surface style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  elevation: 2
                }}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                    {match.home_sets || 0}
                  </Text>
                </Surface>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => updateScore('home', 'subtract')}
                    disabled={updating || match.status !== 'in_progress'}
                    style={{ marginRight: 8 }}
                  />
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => updateScore('home', 'add')}
                    disabled={updating || match.status !== 'in_progress'}
                  />
                </View>
              </View>

              {/* Separador */}
              <Text style={{ fontSize: 24, marginHorizontal: 20, color: theme.colors.onSurfaceVariant }}>
                -
              </Text>

              {/* Equipo visitante */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                  {match.away_team.name}
                </Text>
                <Surface style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  elevation: 2
                }}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                    {match.away_sets || 0}
                  </Text>
                </Surface>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => updateScore('away', 'subtract')}
                    disabled={updating || match.status !== 'in_progress'}
                    style={{ marginRight: 8 }}
                  />
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => updateScore('away', 'add')}
                    disabled={updating || match.status !== 'in_progress'}
                  />
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sets completados */}
        {match.sets && match.sets.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content style={{ padding: 16 }}>
              <Title style={{ marginBottom: 12 }}>Sets Completados</Title>
              {match.sets.map((set, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: 8
                }}>
                  <Text>Set {set.set_number}</Text>
                  <Text style={{ fontWeight: 'bold' }}>
                    {set.home_score} - {set.away_score}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Controles del partido */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 16 }}>
            <Title style={{ marginBottom: 16 }}>Control del Partido</Title>
            
            <View style={{ gap: 12 }}>
              {match.status === 'scheduled' && (
                <Button
                  mode="contained"
                  onPress={startMatch}
                  disabled={updating}
                  icon="play"
                >
                  Iniciar Partido
                </Button>
              )}
              
              {match.status === 'in_progress' && (
                <>
                  <Button
                    mode="outlined"
                    onPress={finishSet}
                    disabled={updating}
                    icon="flag-checkered"
                  >
                    Finalizar Set
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={finishMatch}
                    disabled={updating}
                    icon="stop"
                    buttonColor={theme.colors.error}
                  >
                    Finalizar Partido
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <Card.Content style={{ padding: 16 }}>
            <Title style={{ marginBottom: 16 }}>Acciones Rápidas</Title>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('QRScanner' as never)}
                icon="qrcode-scan"
                style={{ flex: 1, minWidth: '45%' }}
              >
                Escanear QR
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {/* Implementar timeout */}}
                icon="timer"
                style={{ flex: 1, minWidth: '45%' }}
              >
                Timeout
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {/* Implementar sustitución */}}
                icon="account-switch"
                style={{ flex: 1, minWidth: '45%' }}
              >
                Sustitución
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {/* Implementar sanción */}}
                icon="card-text"
                style={{ flex: 1, minWidth: '45%' }}
              >
                Sanción
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialogs */}
      <Portal>
        {/* Dialog para finalizar set */}
        <Dialog visible={setDialog.visible} onDismiss={() => setSetDialog({ ...setDialog, visible: false })}>
          <Dialog.Title>Finalizar Set</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>Confirma el marcador final del set:</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TextInput
                label={match?.home_team.name}
                value={setDialog.homeScore}
                onChangeText={(text) => setSetDialog({ ...setDialog, homeScore: text })}
                keyboardType="numeric"
                mode="outlined"
                style={{ flex: 1 }}
              />
              
              <Text>-</Text>
              
              <TextInput
                label={match?.away_team.name}
                value={setDialog.awayScore}
                onChangeText={(text) => setSetDialog({ ...setDialog, awayScore: text })}
                keyboardType="numeric"
                mode="outlined"
                style={{ flex: 1 }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSetDialog({ ...setDialog, visible: false })}>Cancelar</Button>
            <Button onPress={confirmFinishSet} disabled={updating}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB para acciones rápidas */}
      {match.status === 'in_progress' && (
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
          }}
          onPress={() => {/* Mostrar menú de acciones rápidas */}}
        />
      )}
    </SafeAreaView>
  );
};

export default MatchControlScreen;