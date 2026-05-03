import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Circle, Line as SvgLine } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/lib/api';
import { getToken, logoutRequest } from '../src/lib/auth';
import { getWorkoutHistoryRequest } from '../src/lib/workouts';
import {
  calculateDashboardMetrics,
  getVolumeChartData,
  calculateStreak,
  calculateWeeklyGoalProgress,
} from '../src/lib/metrics';
import { calculateInactivityAlert } from '../src/lib/inactivity';
import { calculateAchievements } from '../src/lib/achievements';
import { FlameIcon } from '@/components/flame-icon';
import { AppBottomNav } from '@/components/app-bottom-nav';

const ACHIEVEMENT_BADGE_MAP = {
  'first-workout': {
    name: 'medal' as const,
    color: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.45)',
    bg: 'rgba(251, 191, 36, 0.16)',
  },
  'ten-workouts': {
    name: 'barbell' as const,
    color: '#22d3ee',
    border: 'rgba(34, 211, 238, 0.45)',
    bg: 'rgba(34, 211, 238, 0.12)',
  },
  'high-volume': {
    name: 'trophy' as const,
    color: '#fcd34d',
    border: 'rgba(253, 224, 71, 0.45)',
    bg: 'rgba(253, 224, 71, 0.12)',
  },
};

const ACHIEVEMENT_BADGE_DEFAULT = {
  name: 'star' as const,
  color: '#94a3b8',
  border: 'rgba(148, 163, 184, 0.35)',
  bg: 'rgba(148, 163, 184, 0.12)',
};

const abbreviateNumber = (value: number) => {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  }

  return `${Math.round(value)}`;
};

function AchievementBadge({ achievementId }: { achievementId: string }) {
  if (achievementId === 'three-day-streak') {
    return (
      <View style={[styles.achievementBadge, styles.achievementBadgeStreak]}>
        <FlameIcon size={22} color="#f97316" />
      </View>
    );
  }

  const cfg = ACHIEVEMENT_BADGE_MAP[achievementId] ?? ACHIEVEMENT_BADGE_DEFAULT;

  return (
    <View
      style={[
        styles.achievementBadge,
        { borderColor: cfg.border, backgroundColor: cfg.bg },
      ]}
    >
      <Ionicons name={cfg.name} size={22} color={cfg.color} />
    </View>
  );
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [score, setScore] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartRange, setChartRange] = useState<'weekly' | 'monthly'>('weekly');
  const [activeDot, setActiveDot] = useState<
    | {
        index: number;
        x: number;
        y: number;
        value: number;
        label: string;
      }
    | null
  >(null);
  const [dotPositions, setDotPositions] = useState<
    Array<{ x: number; y: number; value: number }>
  >([]);
  const dotBufferRef = useRef<Array<{ x: number; y: number; value: number }>>([]);

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

      const [dashboardRes, scoreRes, adherenceRes, historyRes] =
        await Promise.all([
          api.get('/dashboard/me', { headers }),
          api.get('/dashboard/score', { headers }),
          api.get('/dashboard/adherence', { headers }),
          getWorkoutHistoryRequest(),
        ]);

      setDashboard(dashboardRes.data?.data || null);
      setScore(scoreRes.data?.data || null);
      setAdherence(adherenceRes.data?.data || null);
      setHistory(historyRes?.data || []);
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

  const handleChangeRange = (next: 'weekly' | 'monthly') => {
    if (next === chartRange) return;

    setChartRange(next);
    setActiveDot(null);
    setDotPositions([]);
    dotBufferRef.current = [];

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const metrics = calculateDashboardMetrics(history, 5);
  const inactivity = calculateInactivityAlert(history);
  const chartData = useMemo(
    () => getVolumeChartData(history, chartRange),
    [history, chartRange]
  );
  const streak = calculateStreak(history);
  const weeklyGoal = calculateWeeklyGoalProgress(history, 4);
  const achievements = calculateAchievements(history, streak);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const chartHeight = 200;
  const hasChartData = chartData.data.some((value) => value > 0);
  const formattedTotal = Number(chartData.total || 0).toLocaleString('es-CL');
  const deltaPct = chartData.deltaPct;
  const deltaTone =
    deltaPct == null
      ? 'neutral'
      : deltaPct > 0
        ? 'up'
        : deltaPct < 0
          ? 'down'
          : 'neutral';
  const periodLabel = chartRange === 'weekly' ? 'semana pasada' : 'periodo anterior';
  const adherencePercentage = Math.max(
    0,
    Math.min(100, Number(adherence?.adherence_percentage ?? 0))
  );
  const athletePercent = Math.max(
    0,
    Math.min(100, Number(score?.percentile ?? adherencePercentage))
  );
  const topPercent = Math.max(1, 100 - athletePercent);

  const lastWorkout = dashboard?.last_workout;
  const lastWorkoutVolume = Number(dashboard?.metrics?.total_volume ?? 0);
  const lastWorkoutDuration = Number(lastWorkout?.duration_minutes ?? 0);
  const intensityFromVolume =
    !lastWorkout || lastWorkoutDuration <= 0
      ? { label: '—', color: '#94a3b8', bolt: false }
      : lastWorkoutVolume / lastWorkoutDuration > 80
        ? { label: 'ALTA', color: '#fb923c', bolt: true }
        : lastWorkoutVolume / lastWorkoutDuration > 25
          ? { label: 'MEDIA', color: '#fcd34d', bolt: false }
          : { label: 'BAJA', color: '#94a3b8', bolt: false };

  /** Android: emojis junto a fontWeight bold suelen verse como «?»; peso normal + sans-serif ayuda a la fuente emoji. */
  const emojiHeaderStyle = [
    styles.inlineEmoji,
    Platform.OS === 'android' ? styles.inlineEmojiAndroid : null,
  ];

  const getInactivityCardStyle = () => {
    if (inactivity.level === 'danger') {
      return styles.alertCardDanger;
    }

    if (inactivity.level === 'warning') {
      return styles.alertCardWarning;
    }

    if (inactivity.level === 'initial') {
      return styles.alertCardInitial;
    }

    return styles.alertCardOk;
  };

  const getInactivityTitleStyle = () => {
    if (inactivity.level === 'danger') {
      return styles.alertTitleDanger;
    }

    if (inactivity.level === 'warning') {
      return styles.alertTitleWarning;
    }

    if (inactivity.level === 'initial') {
      return styles.alertTitleInitial;
    }

    return styles.alertTitleOk;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text style={styles.subtitle}>Cargando dashboard...</Text>
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
      <View style={styles.header}>
        <Image
          source={require('../assets/images/smartgym-header-wordmark.png')}
          style={styles.headerWordmark}
          contentFit="contain"
          accessibilityLabel="SmartGym"
        />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.streakCard}>
        <View style={[styles.titleWithEmoji, styles.titleWithEmojiCentered]}>
          <View style={styles.streakFlameIcon}>
            <FlameIcon size={22} color="#facc15" />
          </View>
          <Text style={styles.streakTitle}>Racha actual</Text>
        </View>
        <Text style={styles.streakNumber}>{streak} día(s)</Text>
        <Text style={styles.streakSubtitle}>
          {streak === 0
            ? 'Comienza hoy para iniciar tu racha'
            : 'Días consecutivos entrenando'}
        </Text>
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>OBJETIVO SEMANAL</Text>
        <View style={styles.goalMetaRow}>
          <Text style={styles.goalMetaLabel}>Sesiones</Text>
          <Text style={styles.goalMetaValue}>
            {weeklyGoal.completed}/{weeklyGoal.goal}
          </Text>
        </View>
        <View style={styles.goalSegmentsRow}>
          {Array.from({ length: Math.max(weeklyGoal.goal, 1) }).map((_, idx) => (
            <View
              key={`goal-segment-${idx}`}
              style={[
                styles.goalSegment,
                idx < weeklyGoal.completed
                  ? styles.goalSegmentActive
                  : styles.goalSegmentInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.achievementsCard}>
        <View style={[styles.titleWithEmoji, styles.achievementsTitleRow]}>
          <Text style={emojiHeaderStyle}>🏆</Text>
          <Text style={styles.achievementsTitle}>Logros</Text>
        </View>

        {achievements.length === 0 ? (
          <Text style={styles.achievementsEmpty}>
            Aún no tienes logros. ¡Comienza hoy!
          </Text>
        ) : (
          achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <AchievementBadge achievementId={achievement.id} />

              <View style={styles.achievementTextContainer}>
                <Text style={styles.achievementName}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDesc}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.alertCard, getInactivityCardStyle()]}>
        <View style={styles.alertHeaderRow}>
          <Ionicons name="warning" size={15} color="#fca5a5" />
          <Text style={[styles.alertTitle, getInactivityTitleStyle()]}>
            {inactivity.title}
          </Text>
        </View>
        <Text style={styles.alertMessage}>{inactivity.message}</Text>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreTitle}>PUNTUACION ATHLETE</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{score?.score ?? 0}</Text>
            <Text style={styles.scoreLevel}>Nivel {score?.level ?? 'beginner'}</Text>
          </View>
          <Text style={styles.scoreSubtitle}>Estas en el top {topPercent}% de usuarios este mes.</Text>
        </View>

        <View style={styles.scoreRingOuter}>
          <View style={styles.scoreRingInner}>
            <Text style={styles.scoreRingText}>{athletePercent}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.adherenceCard}>
        <Text style={styles.adherenceTitle}>ADHERENCIA</Text>
        <Text style={styles.adherenceValue}>{adherencePercentage}%</Text>
        <View style={styles.adherenceTrack}>
          <View style={[styles.adherenceFill, { width: `${adherencePercentage}%` }]} />
        </View>
        <Text style={styles.adherenceMeta}>
          {adherence?.weekly_sessions ?? 0}/{adherence?.recommended_sessions ?? 0} sesiones esta semana
        </Text>
      </View>

      <View style={styles.metricsCard}>
        <Text style={styles.metricsCardTitle}>Métricas calculadas</Text>

        <View style={styles.metricRow}>
          <View style={[styles.metricIconWrap, styles.metricIconWrapCalendar]}>
            <Ionicons name="calendar-outline" size={20} color="#22d3ee" />
          </View>
          <View style={styles.metricBody}>
            <Text style={styles.metricLabel}>Días entrenados esta semana</Text>
            <Text style={styles.metricValue}>{metrics.weeklyFrequency}</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricRow}>
          <View style={[styles.metricIconWrap, styles.metricIconWrapVolume]}>
            <Ionicons name="barbell-outline" size={20} color="#a5b4fc" />
          </View>
          <View style={styles.metricBody}>
            <Text style={styles.metricLabel}>Volumen total</Text>
            <Text style={styles.metricValue}>
              {Number(metrics.totalVolume || 0).toLocaleString('es-CL')}
            </Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricRow}>
          <View style={[styles.metricIconWrap, styles.metricIconWrapAdherence]}>
            <Ionicons name="pulse-outline" size={20} color="#4ade80" />
          </View>
          <View style={styles.metricBody}>
            <Text style={styles.metricLabel}>Adherencia calculada</Text>
            <Text style={styles.metricValue}>{metrics.calculatedAdherence}%</Text>
            <View style={styles.metricMiniTrack}>
              <View
                style={[
                  styles.metricMiniFill,
                  { width: `${Math.min(100, Math.max(0, Number(metrics.calculatedAdherence) || 0))}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.chartHeader}>
          <View style={styles.chartHeaderTitleWrap}>
            <Text style={styles.cardTitle}>Progreso del volumen</Text>
            <Text style={styles.chartSubtitle}>Carga total levantada (kg)</Text>
          </View>
          <View style={styles.chartChips}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleChangeRange('weekly')}
              style={[
                styles.chartChip,
                chartRange === 'weekly' && styles.chartChipActive,
              ]}
            >
              <Text
                style={[
                  styles.chartChipText,
                  chartRange === 'weekly' && styles.chartChipTextActive,
                ]}
              >
                Semanal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleChangeRange('monthly')}
              style={[
                styles.chartChip,
                chartRange === 'monthly' && styles.chartChipActive,
              ]}
            >
              <Text
                style={[
                  styles.chartChipText,
                  chartRange === 'monthly' && styles.chartChipTextActive,
                ]}
              >
                Mensual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!hasChartData ? (
          <View style={styles.chartEmpty}>
            <View style={styles.chartEmptyIcon}>
              <Ionicons
                name="barbell-outline"
                size={30}
                color="rgba(34, 211, 238, 0.6)"
              />
            </View>
            <Text style={styles.chartEmptyTitle}>Aún sin volumen registrado</Text>
            <Text style={styles.chartEmptySub}>
              Registra tu primer entrenamiento para ver tu progreso aquí.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.chartHeadlineRow}>
              <View style={styles.chartHeadlineLeft}>
                <View style={styles.chartHeadlineValueRow}>
                  <Text style={styles.chartHeadlineValue}>{formattedTotal}</Text>
                  <Text style={styles.chartHeadlineUnit}>{chartData.unit}</Text>
                </View>
                <Text style={styles.chartHeadlineCaption}>
                  {chartRange === 'weekly'
                    ? 'Volumen de los últimos 7 días'
                    : 'Volumen de las últimas 5 semanas'}
                </Text>
              </View>
              <View
                style={[
                  styles.chartDeltaPill,
                  deltaTone === 'up' && styles.chartDeltaPillUp,
                  deltaTone === 'down' && styles.chartDeltaPillDown,
                  deltaTone === 'neutral' && styles.chartDeltaPillNeutral,
                ]}
              >
                <Ionicons
                  name={
                    deltaTone === 'up'
                      ? 'arrow-up'
                      : deltaTone === 'down'
                        ? 'arrow-down'
                        : 'remove'
                  }
                  size={12}
                  color={
                    deltaTone === 'up'
                      ? '#4ade80'
                      : deltaTone === 'down'
                        ? '#f87171'
                        : '#94a3b8'
                  }
                />
                <Text
                  style={[
                    styles.chartDeltaText,
                    deltaTone === 'up' && styles.chartDeltaTextUp,
                    deltaTone === 'down' && styles.chartDeltaTextDown,
                  ]}
                >
                  {deltaPct == null
                    ? 'Sin referencia'
                    : `${Math.abs(deltaPct)}% vs ${periodLabel}`}
                </Text>
              </View>
            </View>

            <View style={styles.chartCanvas}>
              <LineChart
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      data: chartData.data,
                    },
                  ],
                }}
                width={chartWidth}
                height={chartHeight}
                yAxisSuffix=""
                fromZero
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(148, 163, 184, ${opacity})`,
                  fillShadowGradientFrom: 'rgba(34, 211, 238, 0.55)',
                  fillShadowGradientTo: 'rgba(34, 211, 238, 0)',
                  fillShadowGradientFromOpacity: 0.55,
                  fillShadowGradientToOpacity: 0,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#22d3ee',
                    fill: 'rgba(2, 9, 20, 0.95)',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: 'rgba(148, 163, 184, 0.08)',
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                }}
                bezier
                style={styles.chart}
                withVerticalLines={false}
                withHorizontalLines
                withInnerLines
                withOuterLines={false}
                withVerticalLabels
                withHorizontalLabels
                withShadow={false}
                segments={3}
                formatYLabel={(value) => abbreviateNumber(Number(value))}
                renderDotContent={({ x, y, index, indexData }) => {
                  dotBufferRef.current[index] = {
                    x,
                    y,
                    value: Number(indexData),
                  };

                  if (
                    index === chartData.data.length - 1 &&
                    chartData.data.length > 0
                  ) {
                    const buffer = dotBufferRef.current.slice(
                      0,
                      chartData.data.length
                    );
                    const allFilled = buffer.every((p) => p != null);
                    const same =
                      allFilled &&
                      dotPositions.length === buffer.length &&
                      dotPositions.every(
                        (p, i) =>
                          buffer[i] &&
                          Math.abs(p.x - buffer[i].x) < 0.5 &&
                          Math.abs(p.y - buffer[i].y) < 0.5
                      );

                    if (allFilled && !same) {
                      Promise.resolve().then(() => setDotPositions(buffer));
                    }
                  }

                  return null;
                }}
                onDataPointClick={({ value, x, y, index }) => {
                  setActiveDot({
                    index,
                    x,
                    y,
                    value,
                    label: chartData.labels[index] ?? '',
                  });

                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync().catch(() => {});
                  }
                }}
              />

              {dotPositions.length === chartData.data.length &&
                dotPositions.length > 0 && (
                  <Svg
                    style={StyleSheet.absoluteFill}
                    width={chartWidth}
                    height={chartHeight}
                    pointerEvents="none"
                  >
                    {(() => {
                      const sorted = [...dotPositions]
                        .filter(Boolean)
                        .sort((a, b) => a.value - b.value);
                      const lo = sorted[0];
                      const hi = sorted[sorted.length - 1];

                      if (!lo || !hi || lo.value === hi.value) {
                        return null;
                      }

                      const slope = (hi.y - lo.y) / (hi.value - lo.value);
                      const avgY = lo.y + slope * (chartData.average - lo.value);
                      const x1 = dotPositions[0].x;
                      const x2 = dotPositions[dotPositions.length - 1].x;

                      return (
                        <SvgLine
                          x1={x1}
                          y1={avgY}
                          x2={x2}
                          y2={avgY}
                          stroke="rgba(148, 163, 184, 0.55)"
                          strokeWidth={1}
                          strokeDasharray="4,4"
                        />
                      );
                    })()}

                    {chartData.peak.index >= 0 &&
                      dotPositions[chartData.peak.index] && (
                        <>
                          <Circle
                            cx={dotPositions[chartData.peak.index].x}
                            cy={dotPositions[chartData.peak.index].y}
                            r={14}
                            fill="rgba(34, 211, 238, 0.18)"
                          />
                          <Circle
                            cx={dotPositions[chartData.peak.index].x}
                            cy={dotPositions[chartData.peak.index].y}
                            r={5}
                            fill="#22d3ee"
                            stroke="#0b1220"
                            strokeWidth={1.5}
                          />
                        </>
                      )}

                    {(() => {
                      const lastIndex = dotPositions.length - 1;
                      const last = dotPositions[lastIndex];

                      if (!last || lastIndex === chartData.peak.index) {
                        return null;
                      }

                      return (
                        <>
                          <Circle
                            cx={last.x}
                            cy={last.y}
                            r={9}
                            fill="rgba(34, 211, 238, 0.18)"
                          />
                          <Circle
                            cx={last.x}
                            cy={last.y}
                            r={4}
                            fill="#f8fafc"
                            stroke="#22d3ee"
                            strokeWidth={2}
                          />
                        </>
                      );
                    })()}
                  </Svg>
                )}

              {activeDot ? (
                <View
                  style={[
                    styles.chartTooltip,
                    {
                      left: Math.max(
                        4,
                        Math.min(activeDot.x - 50, chartWidth - 100)
                      ),
                      top: Math.max(0, activeDot.y - 44),
                      pointerEvents: 'none',
                    },
                  ]}
                >
                  <Text style={styles.chartTooltipLabel}>{activeDot.label}</Text>
                  <Text style={styles.chartTooltipValue}>
                    {Number(activeDot.value).toLocaleString('es-CL')}{' '}
                    <Text style={styles.chartTooltipUnit}>{chartData.unit}</Text>
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.chartKpiRow}>
              <View style={styles.chartKpiCell}>
                <Text style={styles.chartKpiLabel}>PICO</Text>
                <Text style={styles.chartKpiValue}>
                  {abbreviateNumber(chartData.peak.value)}
                </Text>
                <Text style={styles.chartKpiHint}>
                  {chartData.peak.label || '—'}
                </Text>
              </View>
              <View style={styles.chartKpiDivider} />
              <View style={styles.chartKpiCell}>
                <Text style={styles.chartKpiLabel}>PROMEDIO</Text>
                <Text style={styles.chartKpiValue}>
                  {abbreviateNumber(chartData.average)}
                </Text>
                <Text style={styles.chartKpiHint}>por sesión</Text>
              </View>
              <View style={styles.chartKpiDivider} />
              <View style={styles.chartKpiCell}>
                <Text style={styles.chartKpiLabel}>SESIONES</Text>
                <Text style={styles.chartKpiValue}>{chartData.sessions}</Text>
                <Text style={styles.chartKpiHint}>
                  {chartRange === 'weekly' ? 'esta semana' : 'en 5 semanas'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.lastWorkoutSection}>
        <Text style={styles.lastWorkoutSectionTitle}>RESUMEN ÚLTIMO ENTRENAMIENTO</Text>
        <View style={styles.lastWorkoutCard}>
          <View style={styles.lastWorkoutAvatarWrap}>
            <View style={styles.lastWorkoutAvatarRing}>
              <Image
                source={require('../assets/images/smartgym-tracker-logo.png')}
                style={styles.lastWorkoutAvatarImg}
                contentFit="contain"
              />
            </View>
          </View>

          {!lastWorkout ? (
            <Text style={styles.lastWorkoutEmpty}>Sin entrenamientos registrados aún.</Text>
          ) : (
            <>
              <View style={styles.lastWorkoutGrid}>
                <View style={styles.lastWorkoutCell}>
                  <Text style={styles.lastWorkoutLabel}>SESIÓN</Text>
                  <Text style={styles.lastWorkoutSessionValue} numberOfLines={2}>
                    {String(lastWorkout.type || 'Entrenamiento').toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.lastWorkoutCell, styles.lastWorkoutCellRight]}>
                  <Text style={styles.lastWorkoutLabel}>DURACIÓN</Text>
                  <Text style={styles.lastWorkoutValueWhite}>{lastWorkoutDuration}m</Text>
                </View>
                <View style={styles.lastWorkoutCell}>
                  <Text style={styles.lastWorkoutLabel}>VOLUMEN</Text>
                  <Text style={styles.lastWorkoutValueWhite}>{lastWorkoutVolume}</Text>
                </View>
                <View style={[styles.lastWorkoutCell, styles.lastWorkoutCellRight]}>
                  <Text style={styles.lastWorkoutLabel}>INTENSIDAD</Text>
                  <View style={styles.lastWorkoutIntensityRow}>
                    {intensityFromVolume.bolt ? (
                      <Ionicons name="flash" size={14} color={intensityFromVolume.color} />
                    ) : null}
                    <Text style={[styles.lastWorkoutIntensityText, { color: intensityFromVolume.color }]}>
                      {intensityFromVolume.label}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.lastWorkoutCta}
                onPress={() => router.push('/history')}
                activeOpacity={0.9}
              >
                <Text style={styles.lastWorkoutCtaText}>VER DETALLES</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
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
    color: '#f8fafc',
  },
  headerWordmark: {
    width: 140,
    height: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.24)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  streakCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  titleWithEmoji: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWithEmojiCentered: {
    justifyContent: 'center',
  },
  achievementsTitleRow: {
    marginBottom: 10,
  },
  inlineEmoji: {
    fontSize: 20,
    marginRight: 6,
    fontWeight: '400',
  },
  inlineEmojiAndroid: {
    fontFamily: 'sans-serif',
  },
  streakFlameIcon: {
    marginRight: 6,
  },
  streakTitle: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: '700',
  },
  streakNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  streakSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  goalTitle: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  goalMetaRow: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalMetaLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  goalMetaValue: {
    color: '#e5e7eb',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  goalSegmentsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  goalSegment: {
    flex: 1,
    height: 6,
    borderRadius: 99,
  },
  goalSegmentActive: {
    backgroundColor: '#22d3ee',
  },
  goalSegmentInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  achievementsCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  achievementsTitle: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: '700',
  },
  achievementsEmpty: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBadgeStreak: {
    borderColor: 'rgba(249, 115, 22, 0.5)',
    backgroundColor: 'rgba(249, 115, 22, 0.16)',
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementName: {
    color: '#fff',
    fontWeight: '700',
  },
  achievementDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },
  alertCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertCardOk: {
    backgroundColor: 'rgba(20, 83, 45, 0.35)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  alertCardWarning: {
    backgroundColor: 'rgba(120, 53, 15, 0.35)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  alertCardDanger: {
    backgroundColor: 'rgba(69, 10, 10, 0.7)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  alertCardInitial: {
    backgroundColor: 'rgba(30, 58, 138, 0.35)',
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertTitleOk: {
    color: '#86efac',
  },
  alertTitleWarning: {
    color: '#fcd34d',
  },
  alertTitleDanger: {
    color: '#fca5a5',
  },
  alertTitleInitial: {
    color: '#93c5fd',
  },
  alertMessage: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  scoreCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    borderRadius: 14,
    marginBottom: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: {
    flex: 1,
    paddingRight: 12,
  },
  scoreTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7dd3fc',
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  scoreValue: {
    color: '#22d3ee',
    fontSize: 30,
    fontWeight: '800',
  },
  scoreLevel: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 15,
  },
  scoreSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  scoreRingOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: '#22d3ee',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  scoreRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 9, 20, 0.6)',
  },
  scoreRingText: {
    color: '#22d3ee',
    fontWeight: '800',
    fontSize: 20,
  },
  adherenceCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    borderRadius: 14,
    marginBottom: 14,
    padding: 16,
  },
  adherenceTitle: {
    color: '#7dd3fc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  adherenceValue: {
    color: '#22d3ee',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  adherenceTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    overflow: 'hidden',
  },
  adherenceFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
  },
  adherenceMeta: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#e2e8f0',
  },
  muted: {
    color: '#94a3b8',
    marginTop: 4,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#cbd5e1',
  },
  metricsCard: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  metricsCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  metricIconWrapCalendar: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.28)',
  },
  metricIconWrapVolume: {
    backgroundColor: 'rgba(165, 180, 252, 0.12)',
    borderColor: 'rgba(165, 180, 252, 0.28)',
  },
  metricIconWrapAdherence: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.28)',
  },
  metricBody: {
    flex: 1,
    minWidth: 0,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  metricDivider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    marginVertical: 10,
    marginLeft: 56,
  },
  metricMiniTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
    marginTop: 8,
    maxWidth: '100%',
  },
  metricMiniFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#4ade80',
  },
  chart: {
    marginTop: 0,
    marginLeft: -8,
    borderRadius: 14,
    paddingRight: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartHeaderTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  chartSubtitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: -2,
    marginBottom: 4,
  },
  chartChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chartChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  chartChipActive: {
    borderColor: 'rgba(34, 211, 238, 0.55)',
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  chartChipText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chartChipTextActive: {
    color: '#67e8f9',
  },
  chartHeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  chartHeadlineLeft: {
    flex: 1,
    paddingRight: 8,
  },
  chartHeadlineValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  chartHeadlineValue: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  chartHeadlineUnit: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  chartHeadlineCaption: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  chartDeltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  chartDeltaPillUp: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  chartDeltaPillDown: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  chartDeltaPillNeutral: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  chartDeltaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
  },
  chartDeltaTextUp: {
    color: '#4ade80',
  },
  chartDeltaTextDown: {
    color: '#f87171',
  },
  chartCanvas: {
    position: 'relative',
    marginTop: 8,
  },
  chartTooltip: {
    position: 'absolute',
    minWidth: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(2, 9, 20, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.4)',
    alignItems: 'center',
  },
  chartTooltipLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  chartTooltipValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  chartTooltipUnit: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  chartKpiRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.12)',
  },
  chartKpiCell: {
    flex: 1,
    alignItems: 'center',
  },
  chartKpiDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    marginVertical: 2,
  },
  chartKpiLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  chartKpiValue: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  chartKpiHint: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2,
  },
  chartEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    gap: 6,
  },
  chartEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    marginBottom: 4,
  },
  chartEmptyTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
  },
  chartEmptySub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  lastWorkoutSection: {
    marginBottom: 14,
  },
  lastWorkoutSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#94a3b8',
    marginBottom: 8,
  },
  lastWorkoutCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  lastWorkoutAvatarWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  lastWorkoutAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    backgroundColor: 'rgba(2, 9, 20, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lastWorkoutAvatarImg: {
    width: 72,
    height: 48,
  },
  lastWorkoutEmpty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 8,
  },
  lastWorkoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  lastWorkoutCell: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 12,
  },
  lastWorkoutCellRight: {
    paddingRight: 0,
    paddingLeft: 8,
    alignItems: 'flex-end',
  },
  lastWorkoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748b',
    marginBottom: 4,
  },
  lastWorkoutSessionValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22d3ee',
    lineHeight: 20,
  },
  lastWorkoutValueWhite: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  lastWorkoutIntensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastWorkoutIntensityText: {
    fontSize: 16,
    fontWeight: '800',
  },
  lastWorkoutCta: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22d3ee',
    borderRadius: 10,
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  lastWorkoutCtaText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#0a1628',
  },
});