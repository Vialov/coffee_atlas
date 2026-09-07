import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
export function LoadState({
  message,
  loading = false,
}: {
  message: string;
  loading?: boolean;
}) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {loading && <ActivityIndicator color={colors.primary} />}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  message: { ...typography.body, textAlign: "center", color: colors.text },
});
