import { useEffect, useState } from 'react';
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
import { useCallback } from 'react';
import api from '../src/lib/api';
import { getToken, logoutRequest } from '../src/lib/auth';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [score, setScore] = useState(null);
  const [adherence, setAdherence] = useState(null);

  const fetchData = async () => {
    try {
      const token = await getToken();

      if (!token) {
        router.replace('/');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [dashboardRes, scoreRes, adherenceRes] = await Promise.all([
        api.get('/dashboard/me', { headers }),
        api.get('/dashboard/score', { headers }),
        api.get('/dashboard/adherence', { headers }),
      ]);

      setDashboard(dashboardRes.data?.data || null);
      setScore(scoreRes.data?.data || null);
      setAdherence(adherenceRes.data?.data || null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo cargar el dashboard';

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    await logoutRequest();
    router.replace('/');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.subtitle}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/workout-create')}
      >
        <Text style={styles.primaryButtonText}>Registrar entrenamiento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.secondaryButtonText}>Ver historial</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Score</Text>
        <Text style={styles.bigNumber}>{score?.score ?? 0}</Text>
        <Text style={styles.muted}>Nivel: {score?.level ?? 'beginner'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Adherencia</Text>
        <Text style={styles.bigNumber}>{adherence?.adherence_percentage ?? 0}%</Text>
        <Text style={styles.muted}>
          Sesiones: {adherence?.weekly_sessions ?? 0} / {adherence?.recommended_sessions ?? 0}
        </Text>
        <Text style={styles.muted}>Estado: {adherence?.status ?? 'low'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Último entrenamiento</Text>
        <Text style={styles.itemText}>
          Tipo: {dashboard?.last_workout?.type ?? 'Sin entrenamientos'}
        </Text>
        <Text style={styles.itemText}>
          Duración: {dashboard?.last_workout?.duration_minutes ?? 0} min
        </Text>
        <Text style={styles.itemText}>
          Volumen: {dashboard?.metrics?.total_volume ?? 0}
        </Text>
      </View>
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
  logoutButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2563eb',
  },
  muted: {
    color: '#6b7280',
    marginTop: 4,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
});