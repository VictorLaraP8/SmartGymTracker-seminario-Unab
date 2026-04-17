import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getWorkoutHistoryRequest } from '../src/lib/workouts';

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await getWorkoutHistoryRequest();
      setHistory(response?.data || []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo cargar el historial';

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';

    const date = new Date(dateString);

    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.subtitle}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no hay entrenamientos</Text>
          <Text style={styles.emptyText}>
            Registra tu primer entrenamiento para ver tu historial aquí.
          </Text>
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.type || 'Entrenamiento'}</Text>
            <Text style={styles.itemText}>Fecha: {formatDate(item.workout_date)}</Text>
            <Text style={styles.itemText}>
              Duración: {item.duration_minutes ?? 0} min
            </Text>
            <Text style={styles.itemText}>
              Ejercicios: {item.total_exercises ?? 0}
            </Text>
            <Text style={styles.itemText}>Series: {item.total_sets ?? 0}</Text>
            <Text style={styles.itemText}>
              Repeticiones: {item.total_reps ?? 0}
            </Text>
            <Text style={styles.itemText}>
              Volumen: {item.total_volume ?? 0}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  header: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  backButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
});