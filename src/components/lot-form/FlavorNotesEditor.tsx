import { TextInput, View } from "react-native";
import { FormButton, formStyles } from "./Fields";
import { colors } from "../../theme/colors";
export function FlavorNotesEditor({
  notes,
  input,
  onInput,
  onAdd,
  onChange,
}: {
  notes: string[];
  input: string;
  onInput: (value: string) => void;
  onAdd: () => void;
  onChange: (notes: string[]) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={formStyles.chips}>
        {notes.map((note, index) => (
          <View
            key={`${note}-${index}`}
            style={{
              backgroundColor: [
                colors.flavorPink,
                colors.flavorPeach,
                colors.flavorGreen,
              ][index % 3],
              borderRadius: 14,
            }}
          >
            <FormButton
              transparent
              accessibilityLabel={`Remove flavor note ${note}`}
              label={`${note} ×`}
              onPress={() => onChange(notes.filter((_, i) => i !== index))}
            />
          </View>
        ))}
      </View>
      <View style={formStyles.row}>
        <TextInput
          accessibilityLabel="Add flavor note"
          value={input}
          onChangeText={onInput}
          placeholder="Add flavor note…"
          placeholderTextColor={colors.muted}
          style={[formStyles.input, { flex: 1 }]}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <FormButton
          accessibilityLabel="Add flavor note"
          label="+"
          onPress={onAdd}
        />
      </View>
    </View>
  );
}
