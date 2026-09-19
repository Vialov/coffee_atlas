import Slider from "@react-native-community/slider";
import { Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { FormButton, formStyles } from "./Fields";
export function RatingControl({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const tenths =
    value === null ? 30 : Math.max(10, Math.min(50, Math.round(value * 10)));
  const change = (next: number) =>
    onChange(Math.max(10, Math.min(50, Math.round(next))) / 10);
  return (
    <View style={{ gap: 12 }}>
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: colors.accent, fontSize: 34, textAlign: "center" }}
      >
        {value === null ? "Not rated" : `★ ${(tenths / 10).toFixed(1)}`}
      </Text>
      <View style={formStyles.row}>
        <FormButton
          accessibilityLabel="Decrease rating"
          label="−"
          onPress={() => change(tenths - 1)}
          disabled={value !== null && tenths === 10}
        />
        <Slider
          accessibilityLabel="Coffee rating"
          accessibilityValue={{
            min: 1,
            max: 5,
            now: tenths / 10,
            text: value === null ? "Not rated" : (tenths / 10).toFixed(1),
          }}
          style={{ flex: 1, height: 48 }}
          minimumValue={10}
          maximumValue={50}
          step={1}
          value={tenths}
          onValueChange={change}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.divider}
          thumbTintColor={colors.accent}
        />
        <FormButton
          accessibilityLabel="Increase rating"
          label="+"
          onPress={() => change(tenths + 1)}
          disabled={value !== null && tenths === 50}
        />
      </View>
      <View
        style={[
          formStyles.row,
          { justifyContent: "space-between", paddingHorizontal: 60 },
        ]}
      >
        <Text style={{ color: colors.muted }}>1.0</Text>
        <Text style={{ color: colors.muted }}>5.0</Text>
      </View>
      {value !== null && (
        <FormButton label="Clear rating" onPress={() => onChange(null)} />
      )}
    </View>
  );
}
