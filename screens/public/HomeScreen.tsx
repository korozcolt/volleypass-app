import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VolleyPass</Text>
        <Text style={styles.subtitle}>Plataforma de Voleibol</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Partidos en Vivo</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipo A vs Equipo B</Text>
          <Text style={styles.cardSubtitle}>Set 2 - 15:12</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('LiveMatches')}
          >
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Partidos</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipo C vs Equipo D</Text>
          <Text style={styles.cardSubtitle}>Hoy 18:00</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipo E vs Equipo F</Text>
          <Text style={styles.cardSubtitle}>Mañana 16:30</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Torneos Activos</Text>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Text style={styles.cardTitle}>Liga Nacional 2024</Text>
          <Text style={styles.cardSubtitle}>32 equipos participando</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Text style={styles.cardTitle}>Copa Regional</Text>
          <Text style={styles.cardSubtitle}>16 equipos participando</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Standings')}
        >
          <Text style={styles.primaryButtonText}>Ver Clasificaciones</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;