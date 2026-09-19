import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { CoffeePackage } from "../CoffeePackage";
import type { LotDraft } from "../../utils/lotForm";
import { colors } from "../../theme/colors";
import { FormButton } from "./Fields";

export function LotPhotoPicker({
  draft,
  pendingUri,
  onChange,
}: {
  draft: LotDraft;
  pendingUri: string | null;
  onChange: (uri: string | null) => void;
}) {
  async function pick(camera: boolean) {
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Camera access needed",
            "Allow camera access in device settings to take a package photo. You can also choose one from your library.",
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 0.85,
      };
      const result = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert(
        "Photo unavailable",
        "The photo could not be opened. Please try again.",
      );
    }
  }
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose package photo"
        style={{ width: 190 }}
        onPress={() =>
          Alert.alert("Package photo", "Add a photo to your journal.", [
            { text: "Take photo", onPress: () => void pick(true) },
            { text: "Choose from gallery", onPress: () => void pick(false) },
            { text: "Cancel", style: "cancel" },
          ])
        }
      >
        {pendingUri ? (
          <Image
            source={{ uri: pendingUri }}
            style={{ width: 190, height: 240 }}
            resizeMode="contain"
          />
        ) : (
          <CoffeePackage
            coffee={{
              ...draft,
              name: draft.name || "Your coffee",
              id: "preview",
              createdAt: "",
              updatedAt: "",
            }}
          />
        )}
      </Pressable>
      <Text style={{ color: colors.muted }}>
        Tap to add a package photo · optional
      </Text>
      {(pendingUri || draft.photoPath) && (
        <FormButton label="Remove photo" onPress={() => onChange(null)} />
      )}
    </View>
  );
}
