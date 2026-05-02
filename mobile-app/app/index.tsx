import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getToken, loginRequest, registerRequest } from '../src/lib/auth';

const LOGO_ASPECT_RATIO = 1024 / 682;

const DEMO_EMAIL = 'victor@test.com';
const DEMO_PASSWORD = '123456';

type ScreenMode = 'login' | 'register';

export default function LoginScreen() {
  const [mode, setMode] = useState<ScreenMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await getToken();
        if (token) {
          router.replace('/dashboard');
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const goToRegister = () => {
    setMode('register');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const goToLogin = () => {
    setMode('login');
    setName('');
    setConfirmPassword('');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Debes ingresar correo y contrasena');
        return;
      }

      setLoading(true);
      await loginRequest({ email, password });
      router.replace('/dashboard');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo iniciar sesion';

      Alert.alert('Login fallido', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const nameTrim = name.trim();
    const emailTrim = email.trim();

    if (nameTrim.length < 2) {
      Alert.alert('Error', 'Ingresa un nombre de al menos 2 caracteres');
      return;
    }

    if (!emailTrim) {
      Alert.alert('Error', 'Ingresa tu correo electronico');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contrasenas no coinciden');
      return;
    }

    try {
      setLoading(true);
      await registerRequest({
        name: nameTrim,
        email: emailTrim,
        password,
        role: 'user',
      });
      await loginRequest({ email: emailTrim, password });
      router.replace('/dashboard');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo crear la cuenta';

      Alert.alert('Registro fallido', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperar contrasena', 'Esta modalidad estara disponible pronto.');
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    Alert.alert('Proximamente', `Inicio con ${provider} en desarrollo.`);
  };

  if (checkingSession) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text style={styles.checkingText}>Revisando sesion...</Text>
      </View>
    );
  }

  const isRegister = mode === 'register';

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../assets/images/smartgym-tracker-logo.png')}
          style={styles.logo}
          contentFit="contain"
          contentPosition="center"
          priority="high"
          allowDownscaling={false}
          transition={0}
          accessibilityLabel="SmartGym Tracker"
        />

        <View style={styles.formCard}>
          {isRegister ? (
            <>
              <Text style={styles.fieldLabel}>NOMBRE</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.leadingIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#6b7280"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </>
          ) : null}

          <Text style={styles.fieldLabel}>CORREO ELECTRONICO</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail" size={18} color="#6b7280" style={styles.leadingIcon} />
            <TextInput
              style={styles.input}
              placeholder="nombre@ejemplo.com"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.fieldLabel}>CONTRASENA</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed" size={18} color="#6b7280" style={styles.leadingIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="******"
              placeholderTextColor="#6b7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.togglePassword}
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityLabel={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#7c8ba1"
              />
            </TouchableOpacity>
          </View>

          {isRegister ? (
            <>
              <Text style={styles.fieldLabel}>CONFIRMAR CONTRASENA</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color="#6b7280" style={styles.leadingIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repite la contrasena"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </>
          ) : null}

          {!isRegister ? (
            <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordWrap}>
              <Text style={styles.forgotPassword}>¿Olvide mi contrasena?</Text>
            </Pressable>
          ) : (
            <View style={styles.spacerForgot} />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={isRegister ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0b1735" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{isRegister ? 'CREAR CUENTA' : 'INICIAR SESION'}</Text>
                <Ionicons name="flash" size={16} color="#3c3200" />
              </View>
            )}
          </TouchableOpacity>

          <Pressable onPress={isRegister ? goToLogin : goToRegister} style={styles.modeToggleWrap}>
            <Text style={styles.modeToggleText}>
              {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
              <Text style={styles.modeToggleAccent}>{isRegister ? 'Inicia sesion' : 'Registrate'}</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.continueText}>O CONTINUA CON</Text>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
            <Ionicons name="logo-google" size={16} color="#f97316" />
            <Text style={styles.socialButtonText}>GOOGLE</Text>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
            <Ionicons name="logo-apple" size={16} color="#f3f4f6" />
            <Text style={styles.socialButtonText}>APPLE</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  checkingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#cbd5e1',
  },
  logo: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 330,
    aspectRatio: LOGO_ASPECT_RATIO,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: 'rgba(5, 16, 30, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.16)',
    padding: 16,
  },
  fieldLabel: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 8,
    backgroundColor: 'rgba(2, 9, 20, 0.68)',
    marginBottom: 14,
  },
  leadingIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#dbeafe',
    fontWeight: '600',
  },
  passwordInput: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#dbeafe',
    fontWeight: '600',
  },
  togglePassword: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordWrap: {
    alignSelf: 'center',
    marginBottom: 14,
    marginTop: -2,
  },
  spacerForgot: {
    height: 14,
    marginTop: -2,
  },
  forgotPassword: {
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#d8c659',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    shadowColor: '#d8c659',
    shadowOpacity: 0.38,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#3c3200',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modeToggleWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  modeToggleText: {
    color: 'rgba(209, 213, 219, 0.85)',
    fontSize: 13,
    textAlign: 'center',
  },
  modeToggleAccent: {
    color: '#22d3ee',
    fontWeight: '700',
  },
  continueText: {
    color: 'rgba(209, 213, 219, 0.65)',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 8,
    backgroundColor: 'rgba(2, 9, 20, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 13,
  },
});
