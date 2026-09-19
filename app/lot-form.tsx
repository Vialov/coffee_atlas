import { useLocalSearchParams } from "expo-router";
import { LotFormScreen } from "../src/screens/LotFormScreen";
export default function LotFormRoute() {
  const { lotId } = useLocalSearchParams<{ lotId?: string }>();
  return <LotFormScreen key={lotId ?? "new"} lotId={lotId} />;
}
