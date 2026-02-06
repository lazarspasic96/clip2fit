import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  autoComplete?: "email" | "password" | "password-new";
}

export function AuthInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
  autoComplete,
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showToggle = secureTextEntry !== undefined;

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-inter-medium text-content-secondary">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-md border ${
          error
            ? "border-content-badge-error"
            : isFocused
              ? "border-brand-accent"
              : "border-border-primary"
        } bg-background-secondary px-4`}
      >
        <TextInput
          className="flex-1 py-3 text-base font-inter text-content-primary"
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#71717a"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
        />
        {showToggle && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={8}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#71717a" />
            ) : (
              <Eye size={20} color="#71717a" />
            )}
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="text-xs font-inter text-content-badge-error">
          {error}
        </Text>
      )}
    </View>
  );
}
