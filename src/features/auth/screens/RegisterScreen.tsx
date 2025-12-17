import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useSessionStore } from '@store/session.store';
import { spacing, typography } from '@theme';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { authApi } from '../api/auth.api';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setTokens, setAccount } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'StrongP@ssw0rd',
      name: 'John Doe',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      await setTokens(response.tokens);
      setAccount(response.account);
    } catch (error) {
      const apiError = error as { message?: string; code?: string };
      Alert.alert(
        'Registration Failed',
        apiError.message || 'Unable to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable padding="none">
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Branding */}
            <View style={styles.brandingContainer}>
              <Image
                source={require('../../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandSubtitle}>Your health records, organized</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Create Account</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="John Doe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        placeholderTextColor="#8E8E93"
                      />
                      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                    </>
                  )}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="user@example.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        placeholderTextColor="#8E8E93"
                      />
                      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                    </>
                  )}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder="Enter password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="password"
                        placeholderTextColor="#8E8E93"
                      />
                      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                      <Text style={styles.helperText}>Minimum 6 characters</Text>
                    </>
                  )}
                />
              </View>

              <PrimaryButton
                label={isLoading ? 'Registering...' : 'Register.'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              />

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#2b90f4',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#1E90FF',
    opacity: 0.3,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl * 2,
    paddingBottom: 120,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  logo: {
    width: 200,
    height: 120,
    tintColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 48,
    color: '#000000',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    width: '100%',
  },
  linkText: {
    ...typography.body,
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'center',
  },
});
