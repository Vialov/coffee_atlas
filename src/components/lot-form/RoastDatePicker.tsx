import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, View } from "react-native";
import { formatRoastDate } from "../../utils/lotForm";
import { FormButton, formStyles } from "./Fields";
export function RoastDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(`${value.slice(0, 10)}T12:00:00`) : new Date();
  return (
    <View style={{ gap: 8 }}>
      <Text style={formStyles.label}>Roast date</Text>
      <FormButton
        label={value ? formatRoastDate(value) : "Select date (optional)"}
        onPress={() => setOpen(true)}
      />
      {open && (
        <DateTimePicker
          value={Number.isNaN(date.getTime()) ? new Date() : date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onDismiss={() => setOpen(false)}
          onValueChange={(_event, selected) => {
            if (Platform.OS !== "ios") setOpen(false);
            onChange(
              `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`,
            );
          }}
        />
      )}
      {open && Platform.OS === "ios" && (
        <FormButton
          label="Done"
          onPress={() => {
            if (!value)
              onChange(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
              );
            setOpen(false);
          }}
        />
      )}
      {!!value && (
        <FormButton
          label="Clear date"
          onPress={() => {
            onChange(null);
            setOpen(false);
          }}
        />
      )}
    </View>
  );
}
