import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { CoffeeLot } from "../types/coffee";
import { colors } from "../theme/colors";
import { journalSerif } from "../theme/typography";
import { resolveCoffeePhoto } from "../utils/coffeePhoto";
export function CoffeePackage({ coffee }: { coffee: CoffeeLot }) {
  const uri = resolveCoffeePhoto(coffee.photoPath);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const origin = [coffee.country, coffee.region].filter(Boolean).join(" · ");
  if (uri && uri !== failedUri) {
    return (
      <Image
        source={{
          uri,
        }}
        resizeMode="contain"
        style={styles.photo}
        accessibilityLabel={`Coffee package: ${coffee.name}`}
        onError={() => setFailedUri(uri)}
      />
    );
  }
  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityLabel={`Coffee package: ${[coffee.roaster, coffee.name, origin, coffee.variety].filter(Boolean).join(", ")}`}
    >
      <View style={styles.side} />
      <View style={styles.bag}>
        <View style={styles.seal} />
        <View style={styles.label}>
          <Text style={styles.roaster}>{coffee.roaster}</Text>
          <View style={styles.dash} />
          <Text style={styles.name}>{coffee.name}</Text>
          {!!coffee.variety && (
            <Text style={styles.variety}>{coffee.variety.toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.landscape} />
        {!!origin && <Text style={styles.origin}>{origin.toUpperCase()}</Text>}
        <View style={styles.bottomSeam} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: 240,
  },
  wrapper: {
    width: "100%",
    paddingRight: 9,
    paddingBottom: 5,
  },
  side: {
    position: "absolute",
    right: 0,
    top: 20,
    bottom: 1,
    width: 20,
    backgroundColor: colors.bagEdge,
    borderRadius: 4,
  },
  bag: {
    minHeight: 235,
    backgroundColor: colors.bag,
    borderWidth: 1,
    borderColor: colors.bagEdge,
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: "2px 5px 8px rgba(41, 38, 33, 0.12)",
  },
  seal: {
    height: 23,
    borderBottomWidth: 5,
    borderTopWidth: 9,
    borderColor: colors.bagEdge,
    marginTop: 5,
    opacity: 0.45,
  },
  label: {
    paddingHorizontal: 10,
    paddingTop: 25,
    paddingBottom: 23,
    alignItems: "center",
    gap: 10,
  },
  roaster: {
    fontFamily: journalSerif,
    fontSize: 17,
    color: colors.text,
    textAlign: "center",
  },
  dash: {
    width: 12,
    height: 1,
    backgroundColor: colors.muted,
  },
  name: {
    fontFamily: journalSerif,
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
  },
  variety: {
    fontSize: 8,
    letterSpacing: 1.2,
    textAlign: "center",
    color: colors.text,
  },
  landscape: {
    height: 28,
    backgroundColor: colors.bagLandscape,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 25,
    opacity: 0.65,
  },
  origin: {
    padding: 12,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.text,
  },
  bottomSeam: {
    height: 6,
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: colors.bagEdge,
  },
});
