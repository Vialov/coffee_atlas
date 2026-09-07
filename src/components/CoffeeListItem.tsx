import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CoffeeLot } from "../types/coffee";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { DescriptorChip } from "./DescriptorChip";
export function CoffeeListItem({ coffee }: { coffee: CoffeeLot }) {
  const origin = [coffee.country, coffee.region].filter(Boolean).join(" · ");
  const process = [coffee.process, coffee.variety].filter(Boolean).join(" · ");
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/coffee/[id]", params: { id: coffee.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${coffee.name}, ${coffee.roaster}. View coffee details.`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.information}>
        {!!origin && <Text style={styles.origin}>{origin.toUpperCase()}</Text>}
        <Text style={styles.name}>{coffee.name}</Text>
        <Text style={styles.roaster}>{coffee.roaster}</Text>
        {!!process && <Text style={styles.metadata}>{process}</Text>}
      </View>
      <View style={styles.footer}>
        <View style={styles.chips}>
          {coffee.packageDescriptors.slice(0, 3).map((label, index) => (
            <DescriptorChip key={`${label}-${index}`} label={label} />
          ))}
        </View>
        {coffee.rating !== null && (
          <Text
            accessibilityLabel={`Rating ${coffee.rating.toFixed(1)}`}
            style={styles.rating}
          >
            ★ {coffee.rating.toFixed(1)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: spacing.page,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    gap: spacing.xl,
  },
  pressed: { opacity: 0.75 },
  information: { gap: spacing.xs },
  origin: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  name: { ...typography.name, color: colors.text },
  roaster: { ...typography.body, color: colors.text },
  metadata: {
    ...typography.metadata,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    flexGrow: 1,
    flexShrink: 1,
  },
  rating: { ...typography.body, fontWeight: "600", color: colors.accent },
});
