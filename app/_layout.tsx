import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initializeDatabase } from "../src/db/migrate";
import { LoadState } from "../src/components/LoadState";
import { colors } from "../src/theme/colors";

export const unstable_settings = { initialRouteName: "index" };

export default function RootLayout() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(() => {
        if (active) setState("ready");
      })
      .catch((error: unknown) => {
        console.error("Database initialization failed", error);
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      {state === "ready" ? (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ headerShown: false, title: "Coffee Log" }}
          />
          <Stack.Screen
            name="coffee/[id]"
            options={{ title: "", headerBackButtonDisplayMode: "minimal" }}
          />
        </Stack>
      ) : (
        <LoadState
          loading={state === "loading"}
          message={
            state === "loading"
              ? "Opening your coffee journal…"
              : "Unable to open your coffee journal. Please restart the app to try again. Your saved data has not been reset."
          }
        />
      )}
    </>
  );
}
