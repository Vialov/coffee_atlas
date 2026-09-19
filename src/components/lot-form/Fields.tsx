import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          formStyles.input,
          props.multiline && { minHeight: 160, textAlignVertical: "top" },
          props.style,
          !!error && { borderColor: colors.accent, borderWidth: 1 },
        ]}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.accent }}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function FormButton({
  label,
  onPress,
  primary,
  disabled = false,
  destructive,
  transparent,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  transparent?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        formStyles.button,
        primary && { backgroundColor: colors.primary },
        transparent && { backgroundColor: "transparent" },
        (pressed || disabled) && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          formStyles.label,
          primary && { color: colors.surface },
          destructive && { color: colors.accent },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export const formStyles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: colors.detailSurface,
    color: colors.text,
    borderRadius: 14,
    padding: 16,
    minHeight: 56,
  },
  label: { ...typography.body, color: colors.primary },
  button: {
    minHeight: 48,
    minWidth: 48,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.detailSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
