import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoffeePackage } from "../../src/components/CoffeePackage";
import { CoffeeMetadata } from "../../src/components/CoffeeMetadata";
import { LoadState } from "../../src/components/LoadState";
import { Section } from "../../src/components/Section";
import { getCoffeeLotById } from "../../src/repositories/coffeeRepository";
import type { CoffeeLot } from "../../src/types/coffee";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { journalSerif, typography } from "../../src/theme/typography";
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
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1;
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const [result, setResult] = useState<{
    id: string;
    coffee: CoffeeLot | null;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    let active = true;
    getCoffeeLotById(id)
      .then((coffee) => {
        if (active)
          setResult({
            id,
            coffee,
            error: false,
          });
      })
      .catch((cause: unknown) => {
        console.error("Coffee detail could not be loaded", cause);
        if (active)
          setResult({
            id,
            coffee: null,
            error: true,
          });
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
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, stacked && styles.stacked]}>
          <View style={styles.heading}>
            {!!origin && (
              <Text style={styles.origin}>{origin.toUpperCase()}</Text>
            )}
            <Text accessibilityRole="header" style={styles.title}>
              {coffee.name}
            </Text>
            <Text style={styles.roaster}>{coffee.roaster}</Text>
            {coffee.rating !== null && (
              <Text
                accessibilityLabel={`Rating ${coffee.rating.toFixed(1)}`}
                style={styles.rating}
              >
                ★ {coffee.rating.toFixed(1)}
              </Text>
            )}
          </View>
          <View style={[styles.package, stacked && styles.stackedPackage]}>
            <CoffeePackage
              key={`${coffee.id}:${coffee.photoPath ?? "default"}`}
              coffee={coffee}
            />
          </View>
        </View>
        <View style={styles.metadata}>
          {!!coffee.process && (
            <CoffeeMetadata kind="process" label={coffee.process} />
          )}
          {!!coffee.variety && (
            <CoffeeMetadata kind="variety" label={coffee.variety} />
          )}
          {!!coffee.roastDate && (
            <CoffeeMetadata
              kind="date"
              label={`Roasted ${formatRoastDate(coffee.roastDate)}`}
            />
          )}
        </View>
        {(coffee.packageDescriptors.length > 0 || !!coffee.myImpression) && (
          <View style={styles.divider} />
        )}
        {coffee.packageDescriptors.length > 0 && (
          <Section title="FLAVOR NOTES">
            <View style={styles.chips}>
              {coffee.packageDescriptors.map((label, index) => (
                <View
                  key={`${label}-${index}`}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        flavorColors[index % flavorColors.length],
                    },
                  ]}
                >
                  <Text style={styles.flavor}>{label}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}
        {!!coffee.myImpression && (
          <Section title="MY IMPRESSION">
            <View style={styles.impressionCard}>
              <Text style={styles.impression}>{coffee.myImpression}</Text>
            </View>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const flavorColors = [
  colors.flavorPink,
  colors.flavorPeach,
  colors.flavorGreen,
];
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.page,
    paddingTop: spacing.md,
    paddingBottom: 48,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stacked: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: spacing.xl,
  },
  heading: {
    flex: 1,
    minWidth: 0,
  },
  package: {
    width: "39%",
    maxWidth: 225,
  },
  stackedPackage: {
    width: "70%",
    alignSelf: "center",
  },
  origin: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: journalSerif,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
    color: colors.text,
  },
  roaster: {
    fontSize: 23,
    color: colors.text,
    marginTop: spacing.sm,
  },
  rating: {
    fontSize: 34,
    fontWeight: "500",
    color: colors.accent,
    marginTop: spacing.lg,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: spacing.xl,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    maxWidth: "100%",
  },
  flavor: {
    fontSize: 17,
    lineHeight: 25,
    color: colors.text,
  },
  impressionCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.detailSurface,
  },
  impression: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 27,
    color: colors.text,
  },
});
