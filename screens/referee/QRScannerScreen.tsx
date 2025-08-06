import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, Dimensions } from 'react-native';
import {
  Surface,
  Text,
  Button,
  ActivityIndicator,
  IconButton,
  Card,
  Chip,
} from 'react-native-paper';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface QRScannerScreenProps {
  navigation: any;
  route?: {
    params?: {
      onScan?: (data: string) => void;
      title?: string;
    };
  };
}

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanData, setScanData] = useState<string | null>(null);

  const { onScan, title = 'Escanear Código QR' } = route?.params || {};

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanData(data);
    setLoading(true);

    try {
      // Validar formato del QR
      const qrData = parseQRData(data);
      
      if (qrData) {
        if (onScan) {
          // Si hay callback personalizado, usarlo
          onScan(data);
          navigation.goBack();
        } else {
          // Procesar según el tipo de QR
          await processQRData(qrData);
        }
      } else {
        Alert.alert(
          'Código QR inválido',
          'El código QR escaneado no es válido para esta aplicación.',
          [
            {
              text: 'Escanear otro',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Cancelar',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error processing QR:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al procesar el código QR.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setScanned(false);
              setScanData(null);
            }
          },
          {
            text: 'Cancelar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const parseQRData = (data: string) => {
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(data);
      
      // Validar que tenga los campos necesarios
      if (parsed.type && parsed.id) {
        return parsed;
      }
      
      return null;
    } catch {
      // Si no es JSON, verificar si es una URL válida de la app
      if (data.includes('volleypass://') || data.includes('match/') || data.includes('tournament/')) {
        return { type: 'url', data };
      }
      
      return null;
    }
  };

  const processQRData = async (qrData: any) => {
    switch (qrData.type) {
      case 'match':
        // QR de partido - navegar a control de partido
        Alert.alert(
          'Partido encontrado',
          `¿Deseas acceder al control del partido ${qrData.id}?`,
          [
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Acceder',
              onPress: () => {
                navigation.replace('MatchControl', { matchId: qrData.id });
              }
            }
          ]
        );
        break;
        
      case 'tournament':
        // QR de torneo - navegar a detalles del torneo
        Alert.alert(
          'Torneo encontrado',
          `¿Deseas ver los detalles del torneo ${qrData.name || qrData.id}?`,
          [
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Ver',
              onPress: () => {
                navigation.navigate('TournamentDetail', { tournamentId: qrData.id });
              }
            }
          ]
        );
        break;
        
      case 'player':
        // QR de jugador - navegar a perfil del jugador
        Alert.alert(
          'Jugador encontrado',
          `¿Deseas ver el perfil de ${qrData.name || 'este jugador'}?`,
          [
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Ver Perfil',
              onPress: () => {
                navigation.navigate('PlayerProfile', { playerId: qrData.id });
              }
            }
          ]
        );
        break;
        
      case 'team':
        // QR de equipo - navegar a detalles del equipo
        Alert.alert(
          'Equipo encontrado',
          `¿Deseas ver los detalles del equipo ${qrData.name || qrData.id}?`,
          [
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Ver Equipo',
              onPress: () => {
                navigation.navigate('TeamDetail', { teamId: qrData.id });
              }
            }
          ]
        );
        break;
        
      case 'url':
        // URL de la aplicación
        Alert.alert(
          'Enlace encontrado',
          '¿Deseas abrir este enlace?',
          [
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Abrir',
              onPress: () => {
                // Procesar URL y navegar
                processAppURL(qrData.data);
              }
            }
          ]
        );
        break;
        
      default:
        Alert.alert(
          'Código QR no reconocido',
          'El tipo de código QR no es compatible con esta función.',
          [
            {
              text: 'Escanear otro',
              onPress: () => {
                setScanned(false);
                setScanData(null);
              }
            },
            {
              text: 'Cancelar',
              onPress: () => navigation.goBack()
            }
          ]
        );
    }
  };

  const processAppURL = (url: string) => {
    // Procesar URLs de la aplicación
    if (url.includes('match/')) {
      const matchId = url.split('match/')[1].split('?')[0];
      navigation.replace('MatchDetail', { matchId });
    } else if (url.includes('tournament/')) {
      const tournamentId = url.split('tournament/')[1].split('?')[0];
      navigation.navigate('TournamentDetail', { tournamentId });
    } else {
      navigation.goBack();
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanData(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Surface style={styles.permissionCard}>
          <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
            Permisos de Cámara
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24, color: '#666' }}>
            Necesitamos acceso a la cámara para escanear códigos QR.
          </Text>
          <Button 
            mode="contained" 
            onPress={getCameraPermissions}
            style={{ marginBottom: 12 }}
          >
            Conceder Permisos
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
          >
            Cancelar
          </Button>
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={{ flex: 1, textAlign: 'center' }}>
            {title}
          </Text>
          <IconButton
            icon={flashOn ? "flashlight" : "flashlight-off"}
            size={24}
            onPress={toggleFlash}
          />
        </View>
      </Surface>

      {/* Cámara */}
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        
        {/* Overlay de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Indicador de carga */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Procesando código QR...</Text>
          </View>
        )}
      </View>

      {/* Información y controles */}
      <Surface style={styles.controls}>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16, color: '#666' }}>
          Apunta la cámara hacia un código QR para escanearlo
        </Text>
        
        {scanData && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>Último código escaneado:</Text>
              <Text variant="bodySmall" style={{ color: '#666', fontFamily: 'monospace' }}>
                {scanData.length > 50 ? `${scanData.substring(0, 50)}...` : scanData}
              </Text>
            </Card.Content>
          </Card>
        )}
        
        <View style={styles.buttonRow}>
          {scanned && (
            <Button 
              mode="outlined" 
              onPress={resetScanner}
              style={{ flex: 1, marginRight: 8 }}
            >
              Escanear Otro
            </Button>
          )}
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          >
            {scanned ? 'Finalizar' : 'Cancelar'}
          </Button>
        </View>
      </Surface>

      {/* Información adicional */}
      <Surface style={styles.info}>
        <View style={styles.infoRow}>
          <Chip icon="information" style={{ marginRight: 8 }}>Tip</Chip>
          <Text variant="bodySmall" style={{ flex: 1, color: '#666' }}>
            Mantén el código QR dentro del área de escaneo y asegúrate de que haya buena iluminación
          </Text>
        </View>
      </Surface>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    elevation: 4,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  controls: {
    padding: 16,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  info: {
    padding: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionCard: {
    padding: 24,
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
});

export default QRScannerScreen;