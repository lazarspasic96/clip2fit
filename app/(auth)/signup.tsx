import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { signUp, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupForm) => {
    setAuthError(null);
    const result = await signUp({
      email: data.email,
      password: data.password,
    });
    if (!result.success) {
      setAuthError(result.error ?? "Sign up failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-brand-logo text-2xl font-onest mb-1">
            clip2fit
          </Text>
          <Text className="text-2xl font-inter-bold text-content-primary mb-8">
            Create account
          </Text>

          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoComplete="email"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                  secureTextEntry
                  autoComplete="password-new"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  autoComplete="password-new"
                />
              )}
            />

            {authError && (
              <Text className="text-sm font-inter text-content-badge-error">
                {authError}
              </Text>
            )}

            <AuthButton
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            >
              Sign Up
            </AuthButton>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm font-inter text-content-secondary">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text className="text-sm font-inter-semibold text-brand-accent">
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
