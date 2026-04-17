import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  createWorkoutWithExerciseRequest,
  getExercisesRequest,
} from '../src/lib/workouts';

export default function WorkoutCreateScreen() {
  const [type, setType] = useState('Fuerza');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('40');

  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await getExercisesRequest();
        const exerciseList = response?.data || [];

        setExercises(exerciseList);

        if (exerciseList.length > 0) {
          setSelectedExerciseId(exerciseList[0].id);
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

  const handleSaveWorkout = async () => {
    try {
      if (!type || !durationMinutes || !sets || !reps) {
        Alert.alert('Error', 'Completa todos los campos obligatorios');
        return;
      }

      if (!selectedExerciseId) {
        Alert.alert('Error', 'Debes seleccionar un ejercicio');
        return;
      }

      setLoading(true);

      await createWorkoutWithExerciseRequest({
        type,
        durationMinutes: Number(durationMinutes),
        workoutDate: new Date().toISOString(),
        exerciseId: Number(selectedExerciseId),
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight || 0),
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Registrar entrenamiento</Text>
      <Text style={styles.subtitle}>Registro mínimo funcional del MVP</Text>

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

        <Text style={styles.sectionTitle}>Ejercicio</Text>

        {loadingExercises ? (
          <Text style={styles.helperText}>Cargando ejercicios...</Text>
        ) : exercises.length === 0 ? (
          <Text style={styles.helperText}>No hay ejercicios disponibles</Text>
        ) : (
          <View style={styles.exerciseList}>
            {exercises.map((exercise) => {
              const selected = selectedExerciseId === exercise.id;

              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseOption,
                    selected && styles.exerciseOptionSelected,
                  ]}
                  onPress={() => setSelectedExerciseId(exercise.id)}
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
          </View>
        )}

        <Text style={styles.label}>Series</Text>
        <TextInput
          style={styles.input}
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
          placeholder="4"
        />

        <Text style={styles.label}>Repeticiones</Text>
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          placeholder="10"
        />

        <Text style={styles.label}>Peso</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="40"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveWorkout}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar entrenamiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  exerciseList: {
    marginTop: 4,
  },
  exerciseOption: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  exerciseOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  exerciseNameSelected: {
    color: '#1d4ed8',
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  exerciseMetaSelected: {
    color: '#1d4ed8',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#111827',
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