import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/lib/api';
import { getToken, logoutRequest } from '../src/lib/auth';
import {
  getProfileRequest,
  patchProfileRequest,
  getBodyProgressRequest,
  postBodyProgressRequest,
} from '../src/lib/users';
import { AppBottomNav } from '@/components/app-bottom-nav';

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatRole(role: string | undefined) {
  if (role === 'trainer') return 'Entrenador';
  return 'Usuario';
}

type ProgressRow = {
  id: number;
  fecha: string;
  peso_corporal: number | null;
  porcentaje_grasa: number | null;
  masa_muscular: number | null;
  imc: number | null;
  observacion: string | null;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [score, setScore] = useState<Record<string, unknown> | null>(null);
  const [adherence, setAdherence] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);

  const [nameDraft, setNameDraft] = useState('');
  const [edadDraft, setEdadDraft] = useState('');
  const [alturaDraft, setAlturaDraft] = useState('');
  const [pesoDraft, setPesoDraft] = useState('');
  const [objetivoDraft, setObjetivoDraft] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [medFecha, setMedFecha] = useState(toYMD(new Date()));
  const [medPeso, setMedPeso] = useState('');
  const [medGrasa, setMedGrasa] = useState('');
  const [medMasa, setMedMasa] = useState('');
  const [medObs, setMedObs] = useState('');
  const [savingMed, setSavingMed] = useState(false);

  const fetchData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, scoreRes, adherenceRes, progRes] = await Promise.all([
        getProfileRequest(),
        api.get('/dashboard/score', { headers }),
        api.get('/dashboard/adherence', { headers }),
        getBodyProgressRequest(),
      ]);

      const p = (profileRes as { data?: Record<string, unknown> })?.data ?? null;
      setProfile(p);
      if (p) {
        setNameDraft(String(p.name ?? ''));
        setEdadDraft(p.edad != null ? String(p.edad) : '');
        setAlturaDraft(p.altura_cm != null ? String(p.altura_cm) : '');
        setPesoDraft(p.peso_corporal != null ? String(p.peso_corporal) : '');
        setObjetivoDraft(String(p.objetivo ?? ''));
      }

      setScore(scoreRes.data?.data ?? null);
      setAdherence(adherenceRes.data?.data ?? null);
      const progData = (progRes as { data?: ProgressRow[] })?.data;
      setProgress(Array.isArray(progData) ? progData : []);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err?.response?.data?.message || err?.message || 'No se pudo cargar el perfil';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleLogout = async () => {
    await logoutRequest();
    router.replace('/');
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const body: Record<string, unknown> = {
        name: nameDraft.trim(),
        objetivo: objetivoDraft.trim() || null,
      };
      if (edadDraft.trim() === '') {
        body.edad = null;
      } else {
        body.edad = parseInt(edadDraft, 10);
      }
      if (alturaDraft.trim() === '') {
        body.altura_cm = null;
      } else {
        body.altura_cm = Number(alturaDraft);
      }
      if (pesoDraft.trim() === '') {
        body.peso_corporal = null;
      } else {
        body.peso_corporal = Number(pesoDraft.replace(',', '.'));
      }

      const res = await patchProfileRequest(body);
      const updated = (res as { data?: Record<string, unknown> })?.data;
      if (updated) {
        setProfile(updated);
        Alert.alert('Listo', 'Perfil actualizado');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo guardar');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveMeasurement = async () => {
    try {
      setSavingMed(true);
      const body: Record<string, unknown> = {
        fecha: medFecha.trim(),
        observacion: medObs.trim() || undefined,
      };
      if (medPeso.trim() !== '') body.peso_corporal = Number(medPeso);
      if (medGrasa.trim() !== '') body.porcentaje_grasa = Number(medGrasa);
      if (medMasa.trim() !== '') body.masa_muscular = Number(medMasa);

      await postBodyProgressRequest(body);
      setModalOpen(false);
      setMedPeso('');
      setMedGrasa('');
      setMedMasa('');
      setMedObs('');
      setMedFecha(toYMD(new Date()));
      await fetchData();
      Alert.alert('Listo', 'Medición guardada');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo registrar');
    } finally {
      setSavingMed(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;

  const chartPayload = useMemo(() => {
    const asc = [...progress].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    const slice = asc.slice(-8);
    let labels = slice.map((r) => {
      const d = new Date(r.fecha);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    let data = slice.map((r) => {
      const v = r.peso_corporal != null ? Number(r.peso_corporal) : Number(r.imc ?? 0);
      return Number.isFinite(v) ? v : 0;
    });
    const hasSeries = data.some((n) => n > 0);
    if (hasSeries && data.length === 1) {
      data = [data[0], data[0]];
      labels = [labels[0], ''];
    }
    return { labels, data, hasSeries: hasSeries && data.length > 0 };
  }, [progress]);

  const adherencePct = Math.max(
    0,
    Math.min(100, Number(adherence?.adherence_percentage ?? 0))
  );
  const athletePct = Math.max(0, Math.min(100, Number(score?.percentile ?? 0)));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text style={styles.subtitle}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Datos de cuenta</Text>
          <Text style={styles.rowMuted}>Correo</Text>
          <Text style={styles.rowValue}>{String(profile?.email ?? '—')}</Text>
          <Text style={[styles.rowMuted, styles.rowSpaced]}>Rol</Text>
          <Text style={styles.rowValue}>{formatRole(profile?.role as string)}</Text>
          <Text style={[styles.rowMuted, styles.rowSpaced]}>Miembro desde</Text>
          <Text style={styles.rowValue}>
            {profile?.created_at
              ? new Date(String(profile.created_at)).toLocaleDateString('es')
              : '—'}
          </Text>
        </View>

        <View style={styles.rowCards}>
          <View style={[styles.miniCard, styles.miniCardLeft]}>
            <Text style={styles.miniLabel}>Adherencia</Text>
            <Text style={styles.miniValue}>{adherencePct}%</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Percentil</Text>
            <Text style={styles.miniValue}>{athletePct}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Mi cuerpo</Text>
          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Tu nombre"
            placeholderTextColor="#64748b"
          />
          <Text style={styles.inputLabel}>Edad</Text>
          <TextInput
            style={styles.input}
            value={edadDraft}
            onChangeText={setEdadDraft}
            keyboardType="number-pad"
            placeholder="Años"
            placeholderTextColor="#64748b"
          />
          <Text style={styles.inputLabel}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            value={alturaDraft}
            onChangeText={setAlturaDraft}
            keyboardType="decimal-pad"
            placeholder="Ej. 175"
            placeholderTextColor="#64748b"
          />
          <Text style={styles.inputLabel}>Peso corporal (kg)</Text>
          <TextInput
            style={styles.input}
            value={pesoDraft}
            onChangeText={setPesoDraft}
            keyboardType="decimal-pad"
            placeholder="Tu peso actual"
            placeholderTextColor="#64748b"
          />
          {profile?.imc != null && profile.imc !== '' && !Number.isNaN(Number(profile.imc)) ? (
            <Text style={styles.imcHint}>
              IMC: {Number(profile.imc).toFixed(2)} (según altura y peso del perfil)
            </Text>
          ) : (
            <Text style={[styles.muted, styles.imcHintMuted]}>
              Indica altura y peso corporal para ver tu IMC aquí.
            </Text>
          )}
          <Text style={styles.inputLabel}>Objetivo</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={objetivoDraft}
            onChangeText={setObjetivoDraft}
            placeholder="Ej. ganar masa, perder grasa..."
            placeholderTextColor="#64748b"
            multiline
          />
          <TouchableOpacity
            style={[styles.primaryBtn, savingProfile && styles.primaryBtnDisabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            <Text style={styles.primaryBtnText}>
              {savingProfile ? 'Guardando...' : 'Guardar datos'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionLabel}>Evolución corporal</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
              <Ionicons name="add" size={22} color="#0a1628" />
            </TouchableOpacity>
          </View>
          {chartPayload.hasSeries ? (
            <LineChart
              data={{
                labels: chartPayload.labels,
                datasets: [{ data: chartPayload.data }],
              }}
              width={screenWidth - 64}
              height={180}
              yAxisSuffix=""
              fromZero
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(34, 231, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#22e7ff',
                  fill: '#22e7ff',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: 'rgba(100, 116, 139, 0.2)',
                },
                propsForLabels: { fontSize: 10 },
              }}
              bezier
              style={styles.chart}
              withVerticalLines={false}
              withHorizontalLines={false}
              withInnerLines={false}
              withOuterLines={false}
            />
          ) : (
            <Text style={styles.muted}>
              Registra peso o IMC para ver la tendencia (últimas mediciones).
            </Text>
          )}

          {progress.length === 0 ? (
            <Text style={[styles.muted, styles.listHint]}>Aún no hay mediciones guardadas.</Text>
          ) : (
            progress.map((row) => (
              <View key={row.id} style={styles.progressRow}>
                <Text style={styles.progressDate}>
                  {new Date(row.fecha).toLocaleDateString('es')}
                </Text>
                <Text style={styles.progressMeta}>
                  {row.peso_corporal != null ? `${row.peso_corporal} kg` : '—'}
                  {row.imc != null ? ` · IMC ${row.imc}` : ''}
                  {row.porcentaje_grasa != null ? ` · ${row.porcentaje_grasa}% grasa` : ''}
                </Text>
                {row.observacion ? (
                  <Text style={styles.progressObs}>{row.observacion}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registrar medición</Text>
            <Text style={styles.inputLabel}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={medFecha}
              onChangeText={setMedFecha}
              placeholder="2026-05-02"
              placeholderTextColor="#64748b"
            />
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={medPeso}
              onChangeText={setMedPeso}
              keyboardType="decimal-pad"
              placeholderTextColor="#64748b"
            />
            <Text style={styles.inputLabel}>% grasa corporal</Text>
            <TextInput
              style={styles.input}
              value={medGrasa}
              onChangeText={setMedGrasa}
              keyboardType="decimal-pad"
              placeholderTextColor="#64748b"
            />
            <Text style={styles.inputLabel}>Masa muscular (kg)</Text>
            <TextInput
              style={styles.input}
              value={medMasa}
              onChangeText={setMedMasa}
              keyboardType="decimal-pad"
              placeholderTextColor="#64748b"
            />
            <Text style={styles.inputLabel}>Observación</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={medObs}
              onChangeText={setMedObs}
              placeholder="Opcional"
              placeholderTextColor="#64748b"
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancelar</Text>
              </Pressable>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.modalPrimary, savingMed && styles.primaryBtnDisabled]}
                onPress={handleSaveMeasurement}
                disabled={savingMed}
              >
                <Text style={styles.primaryBtnText}>{savingMed ? '...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AppBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 110 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  subtitle: { fontSize: 16, color: '#94a3b8', marginTop: 12 },
  header: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
  logoutButton: {
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.24)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#7dd3fc',
    marginBottom: 12,
  },
  rowMuted: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.6 },
  rowSpaced: { marginTop: 10 },
  rowValue: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginTop: 2 },
  rowCards: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  miniCard: {
    flex: 1,
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    borderRadius: 14,
    padding: 14,
  },
  miniCardLeft: {},
  miniLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginBottom: 6 },
  miniValue: { fontSize: 24, fontWeight: '800', color: '#22e7ff' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 15,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  imcHint: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#22e7ff',
  },
  imcHintMuted: { marginTop: 10, fontSize: 13 },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#22e7ff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: '#0a1628', fontWeight: '800', fontSize: 15 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#22e7ff',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: { marginTop: 8, borderRadius: 14, marginLeft: -8 },
  muted: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  listHint: { marginTop: 12 },
  progressRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  progressDate: { color: '#e2e8f0', fontWeight: '800', fontSize: 14 },
  progressMeta: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  progressObs: { color: '#cbd5e1', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.25)',
    padding: 18,
    paddingBottom: 28,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#e2e8f0', fontWeight: '700' },
  modalPrimary: { flex: 1, marginTop: 0 },
});
