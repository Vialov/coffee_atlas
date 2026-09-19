import { useState } from "react";
import { Modal, SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  coffeeCountries,
  otherCountries,
  filterCountries,
} from "../../data/countries";
import { colors } from "../../theme/colors";
import { FormButton, TextField, formStyles } from "./Fields";

export function CountrySelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const sections = [
    { title: "COFFEE ORIGINS", data: filterCountries(coffeeCountries, query) },
    {
      title: "ALL COUNTRIES & TERRITORIES",
      data: filterCountries(otherCountries, query),
    },
  ].filter((section) => section.data.length);
  function choose(name: string | null) {
    onChange(name);
    setOpen(false);
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={formStyles.label}>Country</Text>
      <FormButton
        label={`${value || "Select country"}  ▾`}
        onPress={() => {
          setQuery("");
          setOpen(true);
        }}
      />
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
            gap: 16,
          }}
        >
          <View style={[formStyles.row, { justifyContent: "space-between" }]}>
            <Text accessibilityRole="header" style={formStyles.label}>
              SELECT COUNTRY
            </Text>
            <FormButton label="Close" onPress={() => setOpen(false)} />
          </View>
          <TextField
            label="Search countries"
            placeholder="Search…"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          <SectionList
            sections={sections}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.code}
            renderSectionHeader={({ section }) => (
              <Text
                style={{
                  color: colors.primary,
                  backgroundColor: colors.background,
                  paddingVertical: 16,
                }}
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => (
              <FormButton label={item.name} onPress={() => choose(item.name)} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            ListEmptyComponent={
              <Text style={{ color: colors.muted }}>No results</Text>
            }
            ListFooterComponent={
              <View style={{ gap: 12, marginTop: 24 }}>
                <Text style={{ color: colors.muted }}>
                  For a custom country, type its name in Search.
                </Text>
                <FormButton
                  label={
                    query.trim()
                      ? `+ Add “${query.trim()}”`
                      : "+ Add custom country"
                  }
                  disabled={!query.trim()}
                  onPress={() => choose(query.trim())}
                />
                <FormButton
                  label="Clear country"
                  onPress={() => choose(null)}
                />
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
