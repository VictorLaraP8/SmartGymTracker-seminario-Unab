import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  createWorkoutWithExercisesRequest,
  getExercisesRequest,
} from '../src/lib/workouts';
import { AppBottomNav } from '@/components/app-bottom-nav';

type ExerciseOption = {
  id: number;
  name: string;
  muscle_group?: string;
};

type WorkoutExerciseForm = {
  localId: number;
  exerciseId: number | null;
  sets: string;
  reps: string;
  weight: string;
};

const TYPE_MIN_LEN = 2;
const TYPE_MAX_LEN = 80;
const DURATION_MIN = 1;
const DURATION_MAX = 24 * 60;
const SETS_REPS_MAX = 10_000;
const WEIGHT_MAX_KG = 2000;

const POSITIVE_INT_REGEX = /^\d+$/;

const isValidPositiveIntString = (raw: string, max: number) => {
  const trimmed = raw.trim();
  if (!POSITIVE_INT_REGEX.test(trimmed)) {
    return { ok: false as const, reason: 'invalid' };
  }
  const n = Number(trimmed);
  if (n <= 0 || n > max) {
    return { ok: false as const, reason: 'range' };
  }
  return { ok: true as const, value: n };
};

const parseNonNegativeWeight = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: true as const, value: 0 };
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return { ok: false as const };
  }
  if (n < 0 || n > WEIGHT_MAX_KG) {
    return { ok: false as const };
  }
  return { ok: true as const, value: n };
};

export default function WorkoutCreateScreen() {
  const [type, setType] = useState('Fuerza');
  const [durationMinutes, setDurationMinutes] = useState('60');

  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [exercisePickerForLocalId, setExercisePickerForLocalId] = useState<number | null>(null);

  const [exerciseForms, setExerciseForms] = useState<WorkoutExerciseForm[]>([
    {
      localId: 1,
      exerciseId: null,
      sets: '4',
      reps: '10',
      weight: '0',
    },
  ]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await getExercisesRequest();
        const list = response?.data || [];

        setExerciseOptions(list);

        if (list.length > 0) {
          setExerciseForms([
            {
              localId: 1,
              exerciseId: list[0].id,
              sets: '4',
              reps: '10',
              weight: '0',
            },
          ]);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'No se pudieron cargar los ejercicios';

        Alert.alert('Error', message);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  const handleAddExercise = () => {
    const defaultExerciseId =
      exerciseOptions.length > 0 ? exerciseOptions[0].id : null;

    setExerciseForms((current) => [
      ...current,
      {
        localId: Date.now(),
        exerciseId: defaultExerciseId,
        sets: '4',
        reps: '10',
        weight: '0',
      },
    ]);
  };

  const handleRemoveExercise = (localId: number) => {
    if (exerciseForms.length === 1) {
      Alert.alert('Aviso', 'Debes mantener al menos un ejercicio');
      return;
    }

    if (exercisePickerForLocalId === localId) {
      setExercisePickerForLocalId(null);
    }

    setExerciseForms((current) =>
      current.filter((item) => item.localId !== localId)
    );
  };

  const handleSelectExercise = (localId: number, exerciseId: number) => {
    setExerciseForms((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, exerciseId } : item
      )
    );

    setExercisePickerForLocalId(null);
  };

  const handleChangeField = (
    localId: number,
    field: 'sets' | 'reps' | 'weight',
    value: string
  ) => {
    setExerciseForms((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, [field]: value } : item
      )
    );
  };

  const validateWorkout = (): string[] => {
    const errors: string[] = [];

    if (loadingExercises) {
      errors.push('Espera a que terminen de cargar los ejercicios.');
    }

    if (!loadingExercises && exerciseOptions.length === 0) {
      errors.push('No hay ejercicios disponibles; no se puede guardar.');
    }

    const typeTrimmed = type.trim();
    if (typeTrimmed.length < TYPE_MIN_LEN) {
      errors.push(
        `El tipo de entrenamiento debe tener al menos ${TYPE_MIN_LEN} caracteres.`
      );
    } else if (typeTrimmed.length > TYPE_MAX_LEN) {
      errors.push(
        `El tipo de entrenamiento no puede superar ${TYPE_MAX_LEN} caracteres.`
      );
    }

    const durationTrimmed = durationMinutes.trim();
    if (!POSITIVE_INT_REGEX.test(durationTrimmed)) {
      errors.push(
        'La duración debe ser un número entero de minutos (sin decimales ni letras).'
      );
    } else {
      const duration = Number(durationTrimmed);
      if (duration < DURATION_MIN || duration > DURATION_MAX) {
        errors.push(
          `La duración debe estar entre ${DURATION_MIN} y ${DURATION_MAX} minutos.`
        );
      }
    }

    if (exerciseForms.length === 0) {
      errors.push('Debes agregar al menos un ejercicio.');
    }

    const validExerciseIds = new Set(exerciseOptions.map((e) => e.id));

    for (let i = 0; i < exerciseForms.length; i += 1) {
      const item = exerciseForms[i];
      const blockNumber = i + 1;
      const prefix = `Ejercicio ${blockNumber}`;

      if (item.exerciseId == null) {
        errors.push(`${prefix}: selecciona un ejercicio de la lista.`);
      } else if (!validExerciseIds.has(item.exerciseId)) {
        errors.push(
          `${prefix}: el ejercicio elegido ya no está disponible; vuelve a seleccionarlo.`
        );
      }

      const setsCheck = isValidPositiveIntString(item.sets, SETS_REPS_MAX);
      if (!setsCheck.ok) {
        errors.push(
          setsCheck.reason === 'invalid'
            ? `${prefix}: las series deben ser un número entero positivo (solo dígitos).`
            : `${prefix}: las series deben estar entre 1 y ${SETS_REPS_MAX}.`
        );
      }

      const repsCheck = isValidPositiveIntString(item.reps, SETS_REPS_MAX);
      if (!repsCheck.ok) {
        errors.push(
          repsCheck.reason === 'invalid'
            ? `${prefix}: las repeticiones deben ser un número entero positivo (solo dígitos).`
            : `${prefix}: las repeticiones deben estar entre 1 y ${SETS_REPS_MAX}.`
        );
      }

      const weightCheck = parseNonNegativeWeight(item.weight);
      if (!weightCheck.ok) {
        errors.push(
          `${prefix}: el peso debe ser un número entre 0 y ${WEIGHT_MAX_KG} kg (puedes usar decimales, ej. 22.5).`
        );
      }
    }

    return errors;
  };

  const performSaveWorkout = async () => {
    const validationErrors = validateWorkout();
    if (validationErrors.length > 0) {
      Alert.alert(
        'Revisa el formulario',
        validationErrors.map((e) => `• ${e}`).join('\n')
      );
      return;
    }

    try {
      const normalizedExercises = exerciseForms.map((item) => {
        const sets = isValidPositiveIntString(item.sets, SETS_REPS_MAX);
        const reps = isValidPositiveIntString(item.reps, SETS_REPS_MAX);
        const weight = parseNonNegativeWeight(item.weight);
        if (!sets.ok || !reps.ok || !weight.ok) {
          throw new Error('Validación inconsistente; vuelve a intentar.');
        }
        return {
          exerciseId: Number(item.exerciseId),
          sets: sets.value,
          reps: reps.value,
          weight: weight.value,
        };
      });

      setLoading(true);

      await createWorkoutWithExercisesRequest({
        type: type.trim(),
        durationMinutes: Number(durationMinutes),
        workoutDate: new Date().toISOString(),
        exercises: normalizedExercises,
      });

      Alert.alert('Éxito', 'Entrenamiento registrado correctamente');
      router.replace('/dashboard');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo registrar el entrenamiento';

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = () => {
    const validationErrors = validateWorkout();

    if (validationErrors.length > 0) {
      Alert.alert(
        'Revisa el formulario',
        validationErrors.map((e) => `• ${e}`).join('\n')
      );
      return;
    }

    Alert.alert(
      'Confirmar guardado',
      '¿Estás seguro de que quieres guardar este entrenamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, guardar',
          onPress: () => {
            void performSaveWorkout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Registrar entrenamiento</Text>
        <Text style={styles.subtitle}>Ahora con multiples ejercicios</Text>

        <View style={styles.card}>
        <Text style={styles.label}>Tipo de entrenamiento</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Ej: Fuerza"
        />

        <Text style={styles.label}>Duración (minutos)</Text>
        <TextInput
          style={styles.input}
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
          placeholder="60"
        />

        <View style={styles.exerciseHeader}>
          <Text style={styles.sectionTitle}>Ejercicios</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
            disabled={loadingExercises}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {loadingExercises ? (
          <Text style={styles.helperText}>Cargando ejercicios...</Text>
        ) : exerciseOptions.length === 0 ? (
          <Text style={styles.helperText}>No hay ejercicios disponibles</Text>
        ) : (
          exerciseForms.map((form, index) => {
            const selectedExercise = exerciseOptions.find(
              (e) => e.id === form.exerciseId
            );

            return (
              <View key={form.localId} style={styles.exerciseCard}>
                <View style={styles.exerciseCardHeader}>
                  <Text style={styles.exerciseBlockTitle}>
                    Ejercicio {index + 1}
                  </Text>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(form.localId)}
                  >
                    <Text style={styles.removeButtonText}>Quitar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Ejercicio</Text>

                <TouchableOpacity
                  style={[
                    styles.exerciseSelector,
                    !selectedExercise && styles.exerciseSelectorEmpty,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setExercisePickerForLocalId(form.localId)}
                >
                  {selectedExercise ? (
                    <>
                      <Text style={styles.exerciseSelectorName}>
                        {selectedExercise.name}
                      </Text>
                      <Text style={styles.exerciseSelectorMeta}>
                        {selectedExercise.muscle_group || 'Sin grupo muscular'}
                      </Text>
                      <Text style={styles.exerciseSelectorHint}>
                        Toca para cambiar
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.exerciseSelectorPlaceholder}>
                        Elige un ejercicio
                      </Text>
                      <Text style={styles.exerciseSelectorHint}>
                        Toca para elegir
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>Series</Text>
                <TextInput
                  style={styles.input}
                  value={form.sets}
                  onChangeText={(value) =>
                    handleChangeField(form.localId, 'sets', value)
                  }
                  keyboardType="numeric"
                  placeholder="4"
                />

                <Text style={styles.label}>Repeticiones</Text>
                <TextInput
                  style={styles.input}
                  value={form.reps}
                  onChangeText={(value) =>
                    handleChangeField(form.localId, 'reps', value)
                  }
                  keyboardType="numeric"
                  placeholder="10"
                />

                <Text style={styles.label}>Peso</Text>
                <TextInput
                  style={styles.input}
                  value={form.weight}
                  onChangeText={(value) =>
                    handleChangeField(form.localId, 'weight', value)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveWorkout}
          disabled={loading || loadingExercises}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar entrenamiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/dashboard');
            }
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
        </View>

        <Modal
          transparent
          animationType="fade"
          visible={exercisePickerForLocalId !== null}
          onRequestClose={() => setExercisePickerForLocalId(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setExercisePickerForLocalId(null)}
            />

            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Cambiar ejercicio</Text>

              <ScrollView
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
              >
                {exerciseOptions.map((exercise) => {
                  const form = exerciseForms.find(
                    (f) => f.localId === exercisePickerForLocalId
                  );
                  const selected = form?.exerciseId === exercise.id;

                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseOption,
                        selected && styles.exerciseOptionSelected,
                      ]}
                      onPress={() =>
                        exercisePickerForLocalId != null &&
                        handleSelectExercise(
                          exercisePickerForLocalId,
                          exercise.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.exerciseName,
                          selected && styles.exerciseNameSelected,
                        ]}
                      >
                        {exercise.name}
                      </Text>

                      <Text
                        style={[
                          styles.exerciseMeta,
                          selected && styles.exerciseMetaSelected,
                        ]}
                      >
                        {exercise.muscle_group || 'Sin grupo muscular'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setExercisePickerForLocalId(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 6,
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 18,
  },
  card: {
    backgroundColor: 'rgba(2, 9, 20, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    padding: 18,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    color: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22d3ee',
  },
  helperText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(2, 9, 20, 0.55)',
    color: '#e2e8f0',
  },
  exerciseHeader: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.24)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.2)',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    backgroundColor: 'rgba(2, 9, 20, 0.68)',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseBlockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  removeButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  exerciseSelector: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.35)',
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(2, 9, 20, 0.74)',
  },
  exerciseSelectorEmpty: {
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(2, 9, 20, 0.55)',
  },
  exerciseSelectorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22d3ee',
  },
  exerciseSelectorMeta: {
    fontSize: 13,
    color: '#67e8f9',
    marginTop: 4,
    opacity: 0.85,
  },
  exerciseSelectorPlaceholder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  exerciseSelectorHint: {
    fontSize: 12,
    color: '#7dd3fc',
    marginTop: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#061122',
    borderRadius: 16,
    padding: 16,
    maxHeight: '72%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#e2e8f0',
  },
  modalList: {
    maxHeight: 360,
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  exerciseOption: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
  },
  exerciseOptionSelected: {
    borderColor: '#22d3ee',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  exerciseNameSelected: {
    color: '#22d3ee',
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  exerciseMetaSelected: {
    color: '#67e8f9',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#22d3ee',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#062631',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: 'rgba(2, 9, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 231, 255, 0.24)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});