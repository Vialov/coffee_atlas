import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
export function Section({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  section: { gap: spacing.md, marginTop: spacing.xxl },
  title: { ...typography.label, color: colors.primary },
});
