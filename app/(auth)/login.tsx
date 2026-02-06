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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    const result = await signIn(data);
    if (!result.success) {
      setAuthError(result.error ?? "Sign in failed");
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
            Welcome back
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
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
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
                Sign In
              </AuthButton>
            </View>
          </FormProvider>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm font-inter text-content-secondary">
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Text className="text-sm font-inter-semibold text-brand-accent">
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
