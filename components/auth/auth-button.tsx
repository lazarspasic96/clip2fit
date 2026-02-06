import { Pressable, Text, ActivityIndicator } from "react-native";

interface AuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  variant?: "primary" | "secondary";
}

export function AuthButton({
  onPress,
  loading,
  disabled,
  children,
  variant = "primary",
}: AuthButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-md py-3.5 ${
        isPrimary ? "bg-background-button-primary" : "bg-background-button-secondary border border-border-primary"
      } ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#18181b" : "#fafafa"} />
      ) : (
        <Text
          className={`text-base font-inter-semibold ${
            isPrimary ? "text-content-button-primary" : "text-content-primary"
          }`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
