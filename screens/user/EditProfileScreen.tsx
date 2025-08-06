import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Chip,
  Avatar,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface EditProfileScreenProps {
  navigation: any;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  position?: string; // Para jugadores
  jersey_number?: string; // Para jugadores
  club_id?: string; // Para jugadores/técnicos
  experience_years?: string; // Para técnicos/árbitros
  certifications?: string; // Para árbitros
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  jersey_number?: string;
  experience_years?: string;
  general?: string;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    jersey_number: '',
    club_id: '',
    experience_years: '',
    certifications: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Posiciones para jugadores de voleibol
  const positions = [
    { value: 'setter', label: 'Armadora' },
    { value: 'outside_hitter', label: 'Atacante Exterior' },
    { value: 'middle_blocker', label: 'Central' },
    { value: 'opposite', label: 'Opuesta' },
    { value: 'libero', label: 'Líbero' },
    { value: 'defensive_specialist', label: 'Especialista Defensiva' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      
      // Aquí iría la llamada a la API para obtener los datos completos del usuario
      // Por ahora, usamos los datos del contexto de autenticación
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.player_info?.position || '',
          jersey_number: user.player_info?.jersey_number?.toString() || '',
          club_id: user.player_info?.current_club || '',
          experience_years: user.player_info?.years_playing?.toString() || '',
          certifications: '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar teléfono (opcional)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'El formato del teléfono no es válido';
      }
    }

    // Validaciones específicas para jugadores
    if (user?.roles?.includes('player')) {
      if (formData.jersey_number && formData.jersey_number.trim()) {
        const jerseyNum = parseInt(formData.jersey_number);
        if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
          newErrors.jersey_number = 'El número debe estar entre 1 y 99';
        }
      }
    }

    // Validaciones para técnicos y árbitros
    if ((user?.roles?.includes('coach') || user?.roles?.includes('referee')) && formData.experience_years) {
      const years = parseInt(formData.experience_years);
      if (isNaN(years) || years < 0 || years > 50) {
        newErrors.experience_years = 'Los años de experiencia deben estar entre 0 y 50';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Preparar datos para enviar
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
      };

      // Agregar campos específicos según el rol
      if (user?.roles?.includes('player')) {
        if (formData.position) updateData.position = formData.position;
        if (formData.jersey_number) updateData.jersey_number = parseInt(formData.jersey_number);
        if (formData.club_id) updateData.club_id = formData.club_id;
      }

      if (user?.roles?.includes('coach') || user?.roles?.includes('referee')) {
        if (formData.experience_years) updateData.experience_years = parseInt(formData.experience_years);
        if (user?.roles?.includes('coach') && formData.club_id) updateData.club_id = formData.club_id;
        if (user?.roles?.includes('referee') && formData.certifications) updateData.certifications = formData.certifications;
      }

      // Aquí iría la llamada a la API para actualizar el perfil
      // Por ahora, simulamos una actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar el contexto de autenticación
      await updateUser(updateData);
      
      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ 
          general: 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Surface style={{ padding: 24, borderRadius: 12, elevation: 4, marginBottom: 16 }}>
          {/* Header con avatar */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: '#1976d2' }}
            />
            <IconButton
              icon="camera"
              size={20}
              style={{ 
                position: 'absolute', 
                bottom: -10, 
                right: '35%',
                backgroundColor: '#fff',
                elevation: 2
              }}
              onPress={() => {
                // Aquí iría la funcionalidad para cambiar la foto de perfil
                Alert.alert('Próximamente', 'Funcionalidad de cambio de foto en desarrollo');
              }}
            />
            <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: 'bold' }}>
              Editar Perfil
            </Text>
            <Text variant="bodyMedium" style={{ color: '#666', textTransform: 'capitalize' }}>
              {user?.roles?.includes('player') ? 'Jugadora' : 
               user?.roles?.includes('coach') ? 'Técnico/a' :
               user?.roles?.includes('referee') ? 'Árbitro/a' :
               user?.roles?.includes('league_admin') ? 'Admin Liga' : 'Usuario'}
            </Text>
          </View>

          {errors.general && (
            <View style={{ 
              backgroundColor: '#ffebee', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#d32f2f'
            }}>
              <Text style={{ color: '#d32f2f' }}>{errors.general}</Text>
            </View>
          )}

          {/* Información básica */}
          <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
            Información Básica
          </Text>

          <TextInput
            label="Nombre completo"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.name}
            disabled={loading}
            autoCapitalize="words"
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text.toLowerCase())}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.email}
            disabled={loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Teléfono"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.phone}
            disabled={loading}
            keyboardType="phone-pad"
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone}
          </HelperText>

          {/* Información específica para jugadores */}
          {user?.roles?.includes('player') && (
            <>
              <Divider style={{ marginVertical: 16 }} />
              <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                Información Deportiva
              </Text>

              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                Posición:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {positions.map((pos) => (
                  <Chip
                    key={pos.value}
                    selected={formData.position === pos.value}
                    onPress={() => updateFormData('position', pos.value)}
                    style={{ margin: 4 }}
                    disabled={loading}
                  >
                    {pos.label}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Número de camiseta"
                value={formData.jersey_number}
                onChangeText={(text) => updateFormData('jersey_number', text)}
                mode="outlined"
                style={{ marginBottom: 8 }}
                error={!!errors.jersey_number}
                disabled={loading}
                keyboardType="numeric"
                maxLength={2}
              />
              <HelperText type="error" visible={!!errors.jersey_number}>
                {errors.jersey_number}
              </HelperText>
            </>
          )}

          {/* Información específica para técnicos y árbitros */}
          {(user?.roles?.includes('coach') || user?.roles?.includes('referee')) && (
            <>
              <Divider style={{ marginVertical: 16 }} />
              <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                Información Profesional
              </Text>

              <TextInput
                label="Años de experiencia"
                value={formData.experience_years}
                onChangeText={(text) => updateFormData('experience_years', text)}
                mode="outlined"
                style={{ marginBottom: 8 }}
                error={!!errors.experience_years}
                disabled={loading}
                keyboardType="numeric"
                maxLength={2}
              />
              <HelperText type="error" visible={!!errors.experience_years}>
                {errors.experience_years}
              </HelperText>

              {user?.roles?.includes('referee') && (
                <TextInput
                  label="Certificaciones"
                  value={formData.certifications}
                  onChangeText={(text) => updateFormData('certifications', text)}
                  mode="outlined"
                  style={{ marginBottom: 8 }}
                  disabled={loading}
                  multiline
                  numberOfLines={3}
                  placeholder="Ej: Árbitro Nacional FIVB, Curso de Actualización 2023..."
                />
              )}
            </>
          )}

          {/* Botones de acción */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={{ flex: 1, marginLeft: 8 }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;