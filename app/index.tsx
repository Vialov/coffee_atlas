import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoffeeListItem } from "../src/components/CoffeeListItem";
import { LoadState } from "../src/components/LoadState";
import { getAllCoffeeLots } from "../src/repositories/coffeeRepository";
import type { CoffeeLot } from "../src/types/coffee";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { typography } from "../src/theme/typography";
export default function CoffeeLog() {
  const [coffees, setCoffees] = useState<CoffeeLot[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getAllCoffeeLots()
      .then((lots) => {
        if (active) setCoffees(lots);
      })
      .catch((cause: unknown) => {
        console.error("Coffee list could not be loaded", cause);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <LoadState message="Unable to load your coffees. Please reopen the app to try again." />
    );
  if (!coffees) return <LoadState loading message="Loading coffees…" />;
  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={coffees}
        keyExtractor={(coffee) => coffee.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>COFFEE ATLAS</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Coffee Log
            </Text>
            <Text style={styles.count}>
              {coffees.length} {coffees.length === 1 ? "coffee" : "coffees"}
            </Text>
          </View>
        }
        renderItem={({ item }) => <CoffeeListItem coffee={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.count}>Your coffee journal is empty.</Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.page, paddingBottom: spacing.xxl },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.title, color: colors.text },
  count: { ...typography.metadata, color: colors.muted },
  separator: { height: spacing.lg },
});
