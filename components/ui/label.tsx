import { Text } from "react-native";
import { cn } from "./cn";

interface LabelProps {
  text: string;
  required?: boolean;
  className?: string;
}

export function Label({ text, required, className }: LabelProps) {
  return (
    <Text
      className={cn(
        "text-sm font-inter-medium text-content-secondary",
        className,
      )}
    >
      {text}
      {required && <Text className="text-content-badge-error"> *</Text>}
    </Text>
  );
}
