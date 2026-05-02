import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getToken } from '../src/lib/auth';
import {
  getCoachMessagesRequest,
  getCoachRecommendationsRequest,
  getCoachSummaryRequest,
  patchCoachRecommendationReadRequest,
  postCoachMessageRequest,
} from '../src/lib/coach';
import { AppBottomNav } from '@/components/app-bottom-nav';

type CoachSummary = {
  coach: { id: number; name: string; email: string } | null;
  unreadMessagesFromCoach?: number;
  unreadRecommendations?: number;
};

type MessageRow = {
  id: number;
  sender_id: number;
  recipient_id: number;
  body: string;
  created_at: string;
};

type RecommendationRow = {
  id: number;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default function CoachScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [summary, setSummary] = useState<CoachSummary | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const hasCoach = Boolean(summary?.coach);

  const loadAll = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      router.replace('/');
      return;
    }

    try {
      const sumRes = await getCoachSummaryRequest();
      setForbidden(false);
      setSummary((sumRes?.data as CoachSummary) ?? null);

      if (sumRes?.data?.coach) {
        const [msgRes, recRes] = await Promise.all([
          getCoachMessagesRequest(),
          getCoachRecommendationsRequest(),
        ]);
        setMessages((msgRes?.data as MessageRow[]) ?? []);
        setRecommendations((recRes?.data as RecommendationRow[]) ?? []);
      } else {
        setMessages([]);
        setRecommendations([]);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        setForbidden(true);
        setSummary(null);
        setMessages([]);
        setRecommendations([]);
        return;
      }
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo cargar el coach';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAll();
    }, [loadAll])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      await postCoachMessageRequest(text);
      setDraft('');
      await loadAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo enviar el mensaje';
      Alert.alert('Error', message);
    } finally {
      setSending(false);
    }
  };

  const handleMarkRecRead = async (id: number) => {
    try {
      await patchCoachRecommendationReadRequest(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, read_at: r.read_at || new Date().toISOString() } : r))
      );
      const sumRes = await getCoachSummaryRequest();
      setSummary((sumRes?.data as CoachSummary) ?? null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo actualizar';
      Alert.alert('Error', message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22e7ff" />
        <Text style={styles.muted}>Cargando coach...</Text>
        <AppBottomNav />
      </View>
    );
  }

  if (forbidden) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>COACH</Text>
        </View>
        <View style={styles.emptyBlock}>
          <Ionicons name="lock-closed-outline" size={40} color="rgba(148,163,184,0.7)" />
          <Text style={styles.emptyTitle}>Solo para alumnos</Text>
          <Text style={styles.emptyText}>
            Esta sección está disponible para cuentas con rol de usuario. Los entrenadores gestionan
            alumnos desde otras herramientas.
          </Text>
        </View>
        <AppBottomNav />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>COACH</Text>
          {hasCoach ? (
            <Text style={styles.subtitle}>{summary?.coach?.name}</Text>
          ) : (
            <Text style={styles.subtitleMuted}>Sin entrenador asignado</Text>
          )}
        </View>

        {!hasCoach ? (
          <ScrollView
            contentContainerStyle={styles.scrollEmpty}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22e7ff" />
            }
          >
            <View style={styles.emptyBlock}>
              <Ionicons name="person-outline" size={44} color="rgba(34, 231, 255, 0.5)" />
              <Text style={styles.emptyTitle}>Aún no tienes coach</Text>
              <Text style={styles.emptyText}>
                Cuando un entrenador te asigne a su cuenta, verás aquí los mensajes y las
                recomendaciones.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22e7ff" />
            }
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>RECOMENDACIONES</Text>
              {(summary?.unreadRecommendations ?? 0) > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{summary?.unreadRecommendations}</Text>
                </View>
              ) : null}
            </View>
            {recommendations.length === 0 ? (
              <Text style={styles.muted}>No hay recomendaciones todavía.</Text>
            ) : (
              recommendations.map((rec) => (
                <Pressable
                  key={rec.id}
                  style={[styles.recCard, !rec.read_at && styles.recCardUnread]}
                  onPress={() => {
                    if (!rec.read_at) {
                      handleMarkRecRead(rec.id);
                    }
                  }}
                >
                  <View style={styles.recTitleRow}>
                    <Text style={styles.recTitle}>{rec.title}</Text>
                    {!rec.read_at ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.recBody}>{rec.body}</Text>
                </Pressable>
              ))
            )}

            <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/history')}>
              <Ionicons name="time-outline" size={18} color="#22e7ff" />
              <Text style={styles.historyLinkText}>Ver historial de entrenos</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MENSAJES</Text>
              {(summary?.unreadMessagesFromCoach ?? 0) > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{summary?.unreadMessagesFromCoach}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.thread}>
              {messages.map((m) => {
                const coachId = summary?.coach?.id;
                const mine = coachId != null && m.sender_id !== coachId;
                return (
                  <View
                    key={m.id}
                    style={[styles.bubbleWrap, mine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}
                  >
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.body}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {hasCoach ? (
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="rgba(148,163,184,0.6)"
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#020617" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#020617" />
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <AppBottomNav />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 18,
  },
  center: {
    flex: 1,
    paddingTop: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: 4,
    color: '#22e7ff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitleMuted: {
    marginTop: 4,
    color: 'rgba(148,163,184,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  muted: {
    color: 'rgba(148,163,184,0.85)',
    fontSize: 13,
    marginTop: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 120,
    gap: 12,
  },
  scrollEmpty: {
    flexGrow: 1,
    paddingBottom: 120,
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(34, 231, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#22e7ff',
    fontSize: 11,
    fontWeight: '800',
  },
  recCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.12)',
  },
  recCardUnread: {
    borderColor: 'rgba(34, 231, 255, 0.35)',
  },
  recTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22e7ff',
    marginLeft: 8,
  },
  recBody: {
    color: 'rgba(226,232,240,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    paddingVertical: 10,
  },
  historyLinkText: {
    color: '#22e7ff',
    fontSize: 14,
    fontWeight: '700',
  },
  thread: {
    marginTop: 4,
    gap: 8,
  },
  bubbleWrap: {
    flexDirection: 'row',
  },
  bubbleWrapMine: { justifyContent: 'flex-end' },
  bubbleWrapTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleMine: {
    backgroundColor: 'rgba(34, 231, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.35)',
  },
  bubbleTheirs: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  bubbleText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#ecfeff',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 88,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 231, 255, 0.15)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#22e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(148,163,184,0.9)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
