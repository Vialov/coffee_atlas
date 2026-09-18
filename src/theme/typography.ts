import { Platform, type TextStyle } from "react-native";
export const journalSerif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export const typography = {
  title: { fontSize: 36, fontWeight: "700", letterSpacing: -1 },
  name: { fontSize: 24, fontWeight: "600", letterSpacing: -0.5 },
  body: { fontSize: 16, lineHeight: 25 },
  metadata: { fontSize: 14, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 1.5 },
} satisfies Record<string, TextStyle>;
