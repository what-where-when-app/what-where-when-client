import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Button } from "../../src/ui/Button";
import { Text } from "../../src/ui/Text";
import { colors } from "../../src/theme/colors";

export default function Screen() {
  return (
      <SafeAreaView style={styles.root}>
        <Text variant="h2">Typography</Text>
        <Text variant="bodyM" style={{ marginTop: 8 }}>Body M example</Text>
        <Text variant="captionM" style={{ marginTop: 8 }}>Caption M example</Text>

        <View style={{ height: 24 }} />

        <Text variant="h2">Buttons</Text>

        <View style={{ height: 12 }} />
        <Button title="Button" variant="primary" />

        <View style={{ height: 12 }} />
        <Button title="Button" variant="secondary" />

        <View style={{ height: 12 }} />
        <Button title="Button" variant="tertiary" />

        <View style={{ height: 12 }} />
        <Button title="Disabled" variant="primary" disabled />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.neutralLight.light,
  },
});
