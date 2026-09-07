import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
export function DescriptorChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.descriptorSurface,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    maxWidth: "100%",
  },
  text: { ...typography.metadata, color: colors.primary },
});
