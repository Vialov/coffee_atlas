import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
function MetadataIcon({ kind }: { kind: "process" | "variety" | "date" }) {
  return (
    <View
      style={styles.icon}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {kind === "date" ? (
        <View style={styles.calendar}>
          <View style={styles.calendarTop} />
          <View style={styles.calendarDay} />
        </View>
      ) : (
        <View style={[styles.leaf, kind === "process" && styles.drop]} />
      )}
    </View>
  );
}
export function CoffeeMetadata({
  kind,
  label,
}: {
  kind: "process" | "variety" | "date";
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <MetadataIcon kind={kind} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.detailSurface,
    maxWidth: "100%",
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
    flexShrink: 1,
  },
  icon: {
    width: 18,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  leaf: {
    width: 13,
    height: 18,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: colors.primary,
    transform: [
      {
        rotate: "20deg",
      },
    ],
  },
  drop: {
    width: 13,
    height: 13,
    borderRadius: 9,
    borderTopLeftRadius: 0,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },
  calendar: {
    width: 16,
    height: 17,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 2,
  },
  calendarTop: {
    height: 3,
    borderBottomWidth: 2,
    borderColor: colors.primary,
  },
  calendarDay: {
    width: 4,
    height: 4,
    margin: 3,
    backgroundColor: colors.primary,
  },
});
