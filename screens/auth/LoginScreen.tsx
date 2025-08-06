import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Surface,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar email
    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validar contraseña
    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});
      
      const success = await login(form.email, form.password);
      
      if (success) {
        // La navegación se manejará automáticamente por el AuthProvider
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        setErrors({ general: 'Credenciales incorrectas' });
      } else if (error.response?.status === 422) {
        // Errores de validación del servidor
        const serverErrors = error.response.data.errors || {};
        setErrors({
          email: serverErrors.email?.[0],
          password: serverErrors.password?.[0],
        });
      } else if (error.response?.status >= 500) {
        setErrors({ general: 'Error del servidor. Intenta más tarde.' });
      } else {
        setErrors({ general: 'Error de conexión. Verifica tu internet.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 32 }}>
          <Surface
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              elevation: 4,
            }}
          >
            <Icon
              name="volleyball"
              size={40}
              color={theme.colors.primary}
            />
          </Surface>
          <Title style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            VolleyPass
          </Title>
          <Paragraph style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Inicia sesión para acceder a todas las funciones
          </Paragraph>
        </View>

        {/* Formulario de login */}
        <Card style={{ marginBottom: 24 }}>
          <Card.Content style={{ padding: 24 }}>
            <Title style={{ marginBottom: 24, textAlign: 'center' }}>
              Iniciar Sesión
            </Title>

            {/* Error general */}
            {errors.general && (
              <Surface
                style={{
                  backgroundColor: theme.colors.errorContainer,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: theme.colors.onErrorContainer, textAlign: 'center' }}>
                  {errors.general}
                </Text>
              </Surface>
            )}

            {/* Campo de email */}
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(value) => updateForm('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              disabled={loading}
              left={<TextInput.Icon icon="email" />}
              style={{ marginBottom: 8 }}
            />
            {errors.email && (
              <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 16 }}>
                {errors.email}
              </Text>
            )}

            {/* Campo de contraseña */}
            <TextInput
              label="Contraseña"
              value={form.password}
              onChangeText={(value) => updateForm('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password"
              error={!!errors.password}
              disabled={loading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={{ marginBottom: 8 }}
            />
            {errors.password && (
              <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 16 }}>
                {errors.password}
              </Text>
            )}

            {/* Botón de login */}
            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={loading || !form.email.trim() || !form.password.trim()}
              style={{ marginTop: 16, paddingVertical: 8 }}
              contentStyle={{ height: 48 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Enlace de registro */}
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                ¿No tienes cuenta?
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register' as never)}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                Registrarse
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Información adicional */}
        <Card>
          <Card.Content style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon
                name="information"
                size={20}
                color={theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontWeight: 'bold' }}>Acceso por roles</Text>
            </View>
            <Text style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              • <Text style={{ fontWeight: 'bold' }}>Jugadores:</Text> Perfil, estadísticas y carnet{"\n"}
              • <Text style={{ fontWeight: 'bold' }}>Entrenadores:</Text> Gestión de equipo{"\n"}
              • <Text style={{ fontWeight: 'bold' }}>Árbitros:</Text> Control de partidos{"\n"}
              • <Text style={{ fontWeight: 'bold' }}>Liga:</Text> Administración general
            </Text>
          </Card.Content>
        </Card>

        {/* Espaciado inferior */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;