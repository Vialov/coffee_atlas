import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CoffeeListItem } from "../src/components/CoffeeListItem";
import { LoadState } from "../src/components/LoadState";
import { getAllCoffeeLots } from "../src/repositories/coffeeRepository";
import type { CoffeeLot } from "../src/types/coffee";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { typography } from "../src/theme/typography";
export default function CoffeeLog() {
  const insets = useSafeAreaInsets();
  const [coffees, setCoffees] = useState<CoffeeLot[] | null>(null);
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setError(false);
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
    }, []),
  );
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add coffee lot"
        onPress={() => router.push("/lot-form")}
        style={[styles.add, { bottom: insets.bottom + 20 }]}
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  add: {
    position: "absolute",
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  plus: { fontSize: 38, lineHeight: 42, color: colors.surface },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.page, paddingBottom: 110 },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.title, color: colors.text },
  count: { ...typography.metadata, color: colors.muted },
  separator: { height: spacing.lg },
});
