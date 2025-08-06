import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, View, Alert } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Surface,
  Avatar,
  Chip,
  List,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import { UserProfile } from '../../types';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      const response = await api.getUserProfile();
      setProfile(response);
      setEditedProfile(response);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'player':
        return 'Jugador';
      case 'coach':
        return 'Entrenador';
      case 'referee':
        return 'Árbitro';
      case 'league':
        return 'Liga';
      case 'admin':
        return 'Administrador';
      default:
        return userType;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'player':
        return theme.colors.primary;
      case 'coach':
        return '#ff8800';
      case 'referee':
        return '#8800ff';
      case 'league':
      case 'admin':
        return '#ff4444';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!user || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="account-alert" size={64} color={theme.colors.error} />
        <Text style={{ marginTop: 16, textAlign: 'center' }}>No se pudo cargar el perfil</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          Volver
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              onPress={loadProfile}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              textColor={theme.colors.onErrorContainer}
            >
              Reintentar
            </Button>
          </Surface>
        )}

        {/* Header del perfil */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 24 }}>
            <View style={{ alignItems: 'center' }}>
              <Avatar.Text
                size={80}
                label={getInitials(profile.first_name + ' ' + profile.last_name)}
                style={{ marginBottom: 16, backgroundColor: theme.colors.primary }}
              />
              
              <Title style={{ fontSize: 24, marginBottom: 4, textAlign: 'center' }}>
                {profile.first_name} {profile.last_name}
              </Title>
              
              <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                {profile.email || user.email}
              </Text>
              
              <Chip
                mode="flat"
                style={{ backgroundColor: getUserTypeColor(user.user_type) }}
                textStyle={{ color: 'white' }}
              >
                {getUserTypeText(user.user_type)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Información personal */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 16 }}>
            <Title style={{ marginBottom: 16 }}>Información Personal</Title>
            
            <List.Item
              title="Documento de Identidad"
              description={profile.document_number || 'No especificado'}
              left={(props) => <List.Icon {...props} icon="card-account-details" />}
            />
            
            <Divider />
            
            <List.Item
              title="Fecha de Nacimiento"
              description={profile.birth_date ? formatDate(profile.birth_date) : 'No especificada'}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            
            <Divider />
            
            <List.Item
              title="Teléfono"
              description={profile.phone || 'No especificado'}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            
            <Divider />
            
            <List.Item
              title="Dirección"
              description={profile.address || 'No especificada'}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        {/* Información deportiva (solo para jugadores) */}
        {user.user_type === 'player' && profile.player_info && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content style={{ padding: 16 }}>
              <Title style={{ marginBottom: 16 }}>Información Deportiva</Title>
              
              <List.Item
                title="Posición"
                description={profile.player_info.position || 'No especificada'}
                left={(props) => <List.Icon {...props} icon="volleyball" />}
              />
              
              <Divider />
              
              <List.Item
                title="Número de Camiseta"
                description={profile.player_info.jersey_number?.toString() || 'No asignado'}
                left={(props) => <List.Icon {...props} icon="numeric" />}
              />
              
              <Divider />
              
              <List.Item
                title="Altura"
                description={profile.player_info.height ? `${profile.player_info.height} cm` : 'No especificada'}
                left={(props) => <List.Icon {...props} icon="human-male-height" />}
              />
              
              <Divider />
              
              <List.Item
                title="Peso"
                description={profile.player_info.weight ? `${profile.player_info.weight} kg` : 'No especificado'}
                left={(props) => <List.Icon {...props} icon="weight-kilogram" />}
              />
            </Card.Content>
          </Card>
        )}

        {/* Ubicación */}
        {profile.location && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content style={{ padding: 16 }}>
              <Title style={{ marginBottom: 16 }}>Ubicación</Title>
              
              <List.Item
                title="Ciudad"
                description={profile.location.city}
                left={(props) => <List.Icon {...props} icon="city" />}
              />
              
              <Divider />
              
              <List.Item
                title="Estado/Provincia"
                description={profile.location.state}
                left={(props) => <List.Icon {...props} icon="map" />}
              />
              
              <Divider />
              
              <List.Item
                title="País"
                description={profile.location.country}
                left={(props) => <List.Icon {...props} icon="flag" />}
              />
            </Card.Content>
          </Card>
        )}

        {/* Acciones */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content style={{ padding: 16 }}>
            <Title style={{ marginBottom: 16 }}>Acciones</Title>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditProfile' as never)}
              icon="pencil"
              style={{ marginBottom: 12 }}
            >
              Editar Perfil
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Notifications' as never)}
              icon="bell"
              style={{ marginBottom: 12 }}
            >
              Notificaciones
            </Button>
            
            {user.user_type === 'player' && (
              <>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('PlayerSanctions' as never)}
                  icon="gavel"
                  style={{ marginBottom: 12 }}
                >
                  Mis Sanciones
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('PlayerPayments' as never)}
                  icon="credit-card"
                  style={{ marginBottom: 12 }}
                >
                  Mis Pagos
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Cerrar sesión */}
        <Card>
          <Card.Content style={{ padding: 16 }}>
            <Button
              mode="contained"
              onPress={handleLogout}
              icon="logout"
              buttonColor={theme.colors.error}
            >
              Cerrar Sesión
            </Button>
          </Card.Content>
        </Card>

        {/* Espaciado inferior */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;