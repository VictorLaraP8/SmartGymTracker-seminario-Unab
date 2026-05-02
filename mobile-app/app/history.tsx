import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getWorkoutHistoryRequest } from '../src/lib/workouts';
import { AppBottomNav } from '@/components/app-bottom-nav';

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function parseWorkoutDate(item) {
  const raw = item.workout_date || item.created_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAccent(type) {
  const t = String(type || '').toLowerCase();
  if (
    t.includes('empuje') ||
    t.includes('push') ||
    t.includes('pecho') ||
    t.includes('triceps') ||
    t.includes('hombro')
  ) {
    return {
      primary: '#22d3ee',
      name: 'cyan',
      icon: 'flash' as const,
    };
  }
  if (
    t.includes('tir') ||
    t.includes('pull') ||
    t.includes('espalda') ||
    t.includes('biceps') ||
    t.includes('remo')
  ) {
    return {
      primary: '#c4b5fd',
      name: 'purple',
      icon: 'barbell' as const,
    };
  }
  if (t.includes('pierna') || t.includes('leg') || t.includes('lower')) {
    return {
      primary: '#4ade80',
      name: 'green',
      icon: 'barbell' as const,
    };
  }
  return {
    primary: '#22d3ee',
    name: 'cyan',
    icon: 'barbell' as const,
  };
}

function effortBlocks(volume, durationMin) {
  const v = Number(volume) || 0;
  const d = Math.max(Number(durationMin) || 1, 1);
  const density = v / d;
  let filled = 1;
  if (density > 120) filled = 5;
  else if (density > 80) filled = 4;
  else if (density > 45) filled = 3;
  else if (density > 20) filled = 2;
  return Math.min(5, Math.max(1, filled));
}

function formatMonthLabel(referenceDate) {
  const s = referenceDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  return s.toUpperCase();
}

function formatDayHeader(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const isToday = d.getTime() === today.getTime();
  const dayMonth = date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  if (isToday) {
    return `HOY, ${dayMonth.toUpperCase()}`;
  }
  const weekday = date.toLocaleDateString('es-CL', { weekday: 'long' });
  return `${weekday.toUpperCase()}, ${dayMonth.toUpperCase()}`;
}

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

  const now = useMemo(() => new Date(), []);

  const monthWorkouts = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return history.filter((item) => {
      const d = parseWorkoutDate(item);
      if (!d) return false;
      return d >= monthStart && d <= monthEnd;
    });
  }, [history, now]);

  const monthSummary = useMemo(() => {
    if (monthWorkouts.length === 0) {
      return {
        totalVolume: 0,
        avgDuration: 0,
        volumeProgress: 0,
        durationSegments: 0,
      };
    }
    const totalVolume = monthWorkouts.reduce((acc, w) => acc + (Number(w.total_volume) || 0), 0);
    const sumDur = monthWorkouts.reduce((acc, w) => acc + (Number(w.duration_minutes) || 0), 0);
    const avgDuration = Math.round(sumDur / monthWorkouts.length);
    const maxVol = Math.max(...monthWorkouts.map((w) => Number(w.total_volume) || 0), 1);
    const volumeProgress = Math.min(100, Math.round((totalVolume / Math.max(maxVol * 1.35, totalVolume)) * 100));
    const durationSegments = Math.min(5, Math.max(0, Math.round((avgDuration / 90) * 5)));
    return {
      totalVolume,
      avgDuration,
      volumeProgress: totalVolume > 0 ? volumeProgress || 35 : 0,
      durationSegments,
    };
  }, [monthWorkouts]);

  const volumeTonLabel = useMemo(() => {
    const t = monthSummary.totalVolume / 1000;
    return `${t >= 100 ? t.toFixed(0) : t.toFixed(1)} TON`;
  }, [monthSummary.totalVolume]);

  const monthLabel = useMemo(() => formatMonthLabel(now), [now]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text style={styles.subtitle}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/dashboard');
              }
            }}
          >
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
          <>
            <Text style={styles.sectionLabel}>RESUMEN MENSUAL</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>VOLUMEN TOTAL</Text>
                <Text style={styles.summaryCardValue}>{volumeTonLabel}</Text>
                <View style={styles.summaryTrack}>
                  <View
                    style={[styles.summaryFill, { width: `${monthSummary.volumeProgress}%` }]}
                  />
                </View>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>DURACIÓN MEDIA</Text>
                <Text style={styles.summaryCardValue}>{monthSummary.avgDuration} MIN</Text>
                <View style={styles.summarySegments}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View
                      key={`dur-${i}`}
                      style={[
                        styles.summarySegment,
                        i < monthSummary.durationSegments
                          ? styles.summarySegmentOn
                          : styles.summarySegmentOff,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.historyHeaderRow}>
              <Text style={styles.historySectionTitle}>Historial</Text>
              <Text style={styles.historyMonth}>{monthLabel}</Text>
            </View>

            <View style={styles.timeline}>
              {history.map((item, index) => {
                const d = parseWorkoutDate(item);
                const accent = getAccent(item.type);
                const effort = effortBlocks(item.total_volume, item.duration_minutes);
                const isFirst = index === 0;

                return (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineRail}>
                      <View
                        style={[
                          styles.timelineDot,
                          isFirst ? styles.timelineDotActive : styles.timelineDotPast,
                        ]}
                      />
                      {index < history.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>

                    <View style={styles.timelineContent}>
                      <Text style={styles.dayLabel}>
                        {d ? formatDayHeader(d) : 'SIN FECHA'}
                      </Text>
                      <View style={[styles.workoutCard, { borderColor: `${accent.primary}33` }]}>
                        <View style={styles.workoutCardHeader}>
                          <View style={styles.workoutTitleBlock}>
                            <Text style={[styles.workoutTitle, { color: accent.primary }]} numberOfLines={2}>
                              {item.type || 'Entrenamiento'}
                            </Text>
                            <Text style={styles.workoutSubtitle} numberOfLines={1}>
                              {item.total_exercises ?? 0} ejercicios · {item.total_sets ?? 0} series
                            </Text>
                          </View>
                          <Ionicons name={accent.icon} size={20} color={accent.primary} />
                        </View>

                        <View style={styles.statsRow}>
                          <View style={styles.statCell}>
                            <Text style={styles.statLabel}>DURACIÓN</Text>
                            <Text style={styles.statValue}>{item.duration_minutes ?? 0} MIN</Text>
                          </View>
                          <View style={styles.statCell}>
                            <Text style={styles.statLabel}>VOLUMEN</Text>
                            <Text style={styles.statValue}>
                              {Number(item.total_volume ?? 0).toLocaleString('es-CL')}
                            </Text>
                          </View>
                          <View style={styles.statCell}>
                            <Text style={styles.statLabel}>ESFUERZO</Text>
                            <View style={styles.effortRow}>
                              {[0, 1, 2, 3, 4].map((b) => (
                                <View
                                  key={`e-${item.id}-${b}`}
                                  style={[
                                    styles.effortBlock,
                                    b < effort ? { backgroundColor: accent.primary } : styles.effortBlockOff,
                                  ]}
                                />
                              ))}
                            </View>
                          </View>
                        </View>

                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      <AppBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  topBar: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  backButton: {
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.24)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748b',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 12,
  },
  summaryCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748b',
    marginBottom: 6,
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#22d3ee',
    marginBottom: 10,
  },
  summaryTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
  },
  summaryFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 99,
  },
  summarySegments: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  summarySegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  summarySegmentOn: {
    backgroundColor: '#22d3ee',
  },
  summarySegmentOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  historySectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  historyMonth: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#22d3ee',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineRail: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  timelineDotActive: {
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  timelineDotPast: {
    backgroundColor: '#475569',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
    marginBottom: -4,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    minHeight: 24,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  workoutCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  workoutTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  workoutSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.12)',
    paddingTop: 12,
  },
  statCell: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  effortRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  effortBlock: {
    flex: 1,
    height: 6,
    borderRadius: 2,
    maxWidth: 14,
  },
  effortBlockOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.22)',
  },
  emptyCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 20,
    borderRadius: 14,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#e2e8f0',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
  },
});
