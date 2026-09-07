import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DescriptorChip } from "../../src/components/DescriptorChip";
import { LoadState } from "../../src/components/LoadState";
import { Section } from "../../src/components/Section";
import { getCoffeeLotById } from "../../src/repositories/coffeeRepository";
import type { CoffeeLot } from "../../src/types/coffee";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

function formatRoastDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}
export default function CoffeeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [result, setResult] = useState<{
    id: string;
    coffee: CoffeeLot | null;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    let active = true;
    getCoffeeLotById(id)
      .then((coffee) => {
        if (active) setResult({ id, coffee, error: false });
      })
      .catch((cause: unknown) => {
        console.error("Coffee detail could not be loaded", cause);
        if (active) setResult({ id, coffee: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (!result || result.id !== id)
    return <LoadState loading message="Loading coffee…" />;
  if (result.error)
    return (
      <LoadState message="Unable to load this coffee. Go back and try again." />
    );
  const coffee = result.coffee;
  if (!coffee) return <LoadState message="Coffee not found" />;
  const origin = [coffee.country, coffee.region].filter(Boolean).join(" · ");
  const process = [coffee.process, coffee.variety].filter(Boolean).join(" · ");
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!origin && <Text style={styles.origin}>{origin.toUpperCase()}</Text>}
        <Text accessibilityRole="header" style={styles.title}>
          {coffee.name}
        </Text>
        <Text style={styles.roaster}>{coffee.roaster}</Text>
        {!!process && <Text style={styles.metadata}>{process}</Text>}
        {!!coffee.roastDate && (
          <Text style={styles.date}>
            Roasted {formatRoastDate(coffee.roastDate)}
          </Text>
        )}
        {coffee.packageDescriptors.length > 0 && (
          <Section title="DESCRIPTORS">
            <View style={styles.chips}>
              {coffee.packageDescriptors.map((label, index) => (
                <DescriptorChip key={`${label}-${index}`} label={label} />
              ))}
            </View>
          </Section>
        )}
        {!!coffee.myImpression && (
          <Section title="MY IMPRESSION">
            <Text style={styles.impression}>{coffee.myImpression}</Text>
          </Section>
        )}
        {coffee.rating !== null && (
          <Section title="MY RATING">
            <Text
              accessibilityLabel={`Rating ${coffee.rating.toFixed(1)}`}
              style={styles.rating}
            >
              ★ {coffee.rating.toFixed(1)}
            </Text>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.page, paddingBottom: spacing.xxl },
  origin: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.text },
  roaster: {
    ...typography.body,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  metadata: { ...typography.metadata, color: colors.muted },
  date: { ...typography.metadata, color: colors.muted, marginTop: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  impression: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
  },
  rating: { ...typography.name, color: colors.accent },
});
