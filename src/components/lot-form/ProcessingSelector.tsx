import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { TextField, formStyles } from "./Fields";
const processes = ["Washed", "Natural", "Honey", "Anaerobic"];
export function ProcessingSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [other, setOther] = useState(!!value && !processes.includes(value));
  return (
    <View style={{ gap: 12 }}>
      <Text style={formStyles.label}>Processing</Text>
      <View style={formStyles.chips}>
        {[...processes, "Other"].map((process) => {
          const selected =
            process === "Other" ? other : !other && value === process;
          return (
            <Pressable
              key={process}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setOther(process === "Other" && !selected);
                onChange(selected || process === "Other" ? null : process);
              }}
              style={[
                formStyles.button,
                selected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={{ color: selected ? colors.surface : colors.primary }}
              >
                {process}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {other && (
        <TextField
          label="Custom processing"
          value={value ?? ""}
          onChangeText={onChange}
        />
      )}
    </View>
  );
}
