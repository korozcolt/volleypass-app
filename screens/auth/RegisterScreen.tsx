import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface RegisterScreenProps {
  navigation: any;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role: 'player' | 'coach' | 'referee' | 'league_admin';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  general?: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    role: 'player',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Confirma tu contraseña';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    // Validar teléfono (opcional)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'El formato del teléfono no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Aquí iría la llamada a la API de registro
      // Por ahora, simulamos un registro exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular respuesta exitosa
      const mockResponse = {
        user: {
          id: '1',
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
        },
        token: 'mock-jwt-token',
      };

      await login(mockResponse.user, mockResponse.token);
      
      // La navegación se manejará automáticamente por el AuthProvider
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        // Errores de validación del servidor
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ 
          general: 'Error al crear la cuenta. Por favor, inténtalo de nuevo.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const roleOptions = [
    { value: 'player', label: 'Jugadora' },
    { value: 'coach', label: 'Técnico/a' },
    { value: 'referee', label: 'Árbitro/a' },
    { value: 'league_admin', label: 'Administrador Liga' },
  ];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
      >
        <Surface style={{ padding: 24, borderRadius: 12, elevation: 4 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
              VolleyPass
            </Text>
            <Text variant="titleMedium" style={{ marginTop: 8, color: '#666' }}>
              Crear nueva cuenta
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

          {/* Nombre */}
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

          {/* Email */}
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
            autoComplete="email"
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          {/* Teléfono */}
          <TextInput
            label="Teléfono (opcional)"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.phone}
            disabled={loading}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone}
          </HelperText>

          {/* Rol */}
          <Text variant="titleMedium" style={{ marginBottom: 12, marginTop: 8 }}>
            Tipo de usuario:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {roleOptions.map((option) => (
              <Chip
                key={option.value}
                selected={formData.role === option.value}
                onPress={() => updateFormData('role', option.value as FormData['role'])}
                style={{ margin: 4 }}
                disabled={loading}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {/* Contraseña */}
          <TextInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.password}
            disabled={loading}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon 
                icon={showPassword ? 'eye-off' : 'eye'} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            autoComplete="new-password"
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          {/* Confirmar Contraseña */}
          <TextInput
            label="Confirmar contraseña"
            value={formData.password_confirmation}
            onChangeText={(text) => updateFormData('password_confirmation', text)}
            mode="outlined"
            style={{ marginBottom: 8 }}
            error={!!errors.password_confirmation}
            disabled={loading}
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? 'eye-off' : 'eye'} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            autoComplete="new-password"
          />
          <HelperText type="error" visible={!!errors.password_confirmation}>
            {errors.password_confirmation}
          </HelperText>

          {/* Botón de Registro */}
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 16, paddingVertical: 8 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <Divider style={{ marginVertical: 24 }} />

          {/* Link para ir al login */}
          <View style={{ alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              ¿Ya tienes una cuenta?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              Iniciar sesión
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;