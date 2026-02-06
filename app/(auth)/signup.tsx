import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { FormInput } from "@/components/ui/form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/contexts/auth-context";
import { useZodForm } from "@/hooks/use-zod-form";

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

  const form = useZodForm({
    schema: signupSchema,
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

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="email"
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <FormInput
                name="password"
                label="Password"
                placeholder="At least 6 characters"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />

              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />

              {authError && (
                <Text className="text-sm font-inter text-content-badge-error">
                  {authError}
                </Text>
              )}

              <AuthButton
                onPress={form.handleSubmit(onSubmit)}
                loading={loading}
              >
                Sign Up
              </AuthButton>
            </View>
          </FormProvider>

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
