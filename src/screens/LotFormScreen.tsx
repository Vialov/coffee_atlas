import { randomUUID } from "expo-crypto";
import { router, Stack, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadState } from "../components/LoadState";
import { Section } from "../components/Section";
import { CountrySelector } from "../components/lot-form/CountrySelector";
import { FlavorNotesEditor } from "../components/lot-form/FlavorNotesEditor";
import { FormButton, TextField } from "../components/lot-form/Fields";
import { LotPhotoPicker } from "../components/lot-form/LotPhotoPicker";
import { ProcessingSelector } from "../components/lot-form/ProcessingSelector";
import { RatingControl } from "../components/lot-form/RatingControl";
import { RoastDatePicker } from "../components/lot-form/RoastDatePicker";
import {
  createCoffeeLot,
  deleteCoffeeLot,
  getCoffeeLotById,
  updateCoffeeLot,
} from "../repositories/coffeeRepository";
import { colors } from "../theme/colors";
import { persistCoffeePhoto, removeCoffeePhoto } from "../utils/coffeePhoto";
import {
  addFlavorNote,
  draftFromLot,
  emptyLot,
  type LotDraft,
} from "../utils/lotForm";

export function LotFormScreen({ lotId }: { lotId?: string }) {
  const navigation = useNavigation();
  const [draft, setDraft] = useState<LotDraft>(emptyLot);
  const [original, setOriginal] = useState<LotDraft>(emptyLot);
  const [loading, setLoading] = useState(!!lotId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [exit, setExit] = useState<"saved" | "deleted" | null>(null);
  const scroll = useRef<ScrollView>(null);
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(original) ||
    !!noteInput ||
    !!pendingPhoto;

  usePreventRemove(!exit && (dirty || busy), ({ data }) => {
    if (locked.current) return;
    Alert.alert("Discard changes?", "Your changes have not been saved.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
  useEffect(() => {
    if (!lotId) return;
    let active = true;
    getCoffeeLotById(lotId)
      .then((lot) => {
        if (!active) return;
        if (!lot) setLoadError("This lot no longer exists.");
        else {
          const value = draftFromLot(lot);
          setDraft(value);
          setOriginal(value);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError("Unable to load this lot. Go back and try again.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [lotId]);
  useEffect(() => {
    if (!exit) return;
    if (exit === "deleted") router.dismissTo("/");
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [exit]);
  function field<K extends keyof LotDraft>(key: K, value: LotDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  async function save() {
    if (locked.current) return;
    if (!draft.name.trim()) {
      setNameError(true);
      scroll.current?.scrollTo({ y: 230, animated: true });
      return;
    }
    locked.current = true;
    setBusy(true);
    let copied: string | null = null;
    try {
      if (pendingPhoto) copied = persistCoffeePhoto(pendingPhoto, randomUUID());
      const values = {
        ...draft,
        photoPath: copied ?? draft.photoPath,
        packageDescriptors: addFlavorNote(draft.packageDescriptors, noteInput),
      };
      if (lotId) await updateCoffeeLot(lotId, values);
      else await createCoffeeLot(values);
      if (original.photoPath !== values.photoPath)
        removeCoffeePhoto(original.photoPath);
      setExit("saved");
    } catch {
      removeCoffeePhoto(copied);
      Alert.alert(
        "Could not save lot",
        "Your changes are still here. Please try again.",
      );
      locked.current = false;
      setBusy(false);
    }
  }
  function confirmDelete() {
    Alert.alert("Delete this lot?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!lotId || locked.current) return;
          locked.current = true;
          setBusy(true);
          try {
            await deleteCoffeeLot(lotId);
            removeCoffeePhoto(original.photoPath);
            setExit("deleted");
          } catch {
            Alert.alert("Could not delete lot", "Please try again.");
            locked.current = false;
            setBusy(false);
          }
        },
      },
    ]);
  }
  if (loading) return <LoadState loading message="Opening lot…" />;
  if (loadError) return <LoadState message={loadError} />;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom", "left", "right"]}
    >
      <Stack.Screen
        options={{
          title: lotId ? "Edit lot" : "New lot",
          headerBackButtonDisplayMode: "minimal",
          headerBackButtonMenuEnabled: false,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
            maxWidth: 720,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <View
            pointerEvents={busy ? "none" : "auto"}
            accessibilityElementsHidden={busy}
          >
            <LotPhotoPicker
              draft={draft}
              pendingUri={pendingPhoto}
              onChange={(uri) => {
                setPendingPhoto(uri);
                if (!uri) field("photoPath", null);
              }}
            />
            <Section title="BASIC INFO">
              <TextField
                label="Lot name"
                placeholder="Ethiopia Bensa"
                value={draft.name}
                onChangeText={(value) => {
                  field("name", value);
                  if (value.trim()) setNameError(false);
                }}
                error={nameError ? "Please enter a lot name." : undefined}
              />
              <TextField
                label="Roaster"
                placeholder="Sonder"
                value={draft.roaster}
                onChangeText={(value) => field("roaster", value)}
              />
            </Section>
            <Section title="ORIGIN">
              <CountrySelector
                value={draft.country}
                onChange={(value) => field("country", value)}
              />
              <TextField
                label="Region"
                placeholder="Sidama"
                value={draft.region ?? ""}
                onChangeText={(value) => field("region", value)}
              />
            </Section>
            <Section title="COFFEE">
              <ProcessingSelector
                value={draft.process}
                onChange={(value) => field("process", value)}
              />
              <TextField
                label="Variety"
                placeholder="Heirloom"
                value={draft.variety ?? ""}
                onChangeText={(value) => field("variety", value)}
              />
              <RoastDatePicker
                value={draft.roastDate}
                onChange={(value) => field("roastDate", value)}
              />
            </Section>
            <Section title="FLAVOR NOTES">
              <FlavorNotesEditor
                notes={draft.packageDescriptors}
                input={noteInput}
                onInput={setNoteInput}
                onAdd={() => {
                  field(
                    "packageDescriptors",
                    addFlavorNote(draft.packageDescriptors, noteInput),
                  );
                  setNoteInput("");
                }}
                onChange={(value) => field("packageDescriptors", value)}
              />
            </Section>
            <Section title="MY RATING">
              <RatingControl
                value={draft.rating}
                onChange={(value) => field("rating", value)}
              />
            </Section>
            <Section title="MY IMPRESSION">
              <TextField
                label="Tasting impression"
                multiline
                placeholder="What stayed with you about this cup?"
                value={draft.myImpression ?? ""}
                onChangeText={(value) => field("myImpression", value)}
              />
            </Section>
          </View>
          <View style={{ marginTop: 32, gap: 24 }}>
            <FormButton
              label={busy ? "Saving…" : "SAVE LOT"}
              primary
              disabled={busy}
              onPress={() => void save()}
            />
            {lotId && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: colors.divider,
                  paddingTop: 24,
                }}
              >
                <FormButton
                  destructive
                  label="Delete lot"
                  disabled={busy}
                  onPress={confirmDelete}
                />
                <Text
                  style={{
                    color: colors.muted,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Permanently remove this lot from your journal.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
