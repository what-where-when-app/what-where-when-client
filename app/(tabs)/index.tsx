import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { tokens } from "@/src/theme/tokens";
import { Box, Text } from "@/src/ui/primitives";
import { Button } from "@/src/ui/Button";

export default function Screen() {
  return (
      <SafeAreaView style={styles.root}>
        <Box style={styles.card}>
          <Text variant="title">Design System</Text>
          <Text variant="muted">Один UI для web и native</Text>
          <Text variant="caption">tokens + primitives + button</Text>

          <Box style={{ height: tokens.space[4] }} />

          <Button title="Primary" onPress={() => {}} />
          <Box style={{ height: tokens.space[2] }} />
          <Button title="Secondary" variant="secondary" onPress={() => {}} />
          <Box style={{ height: tokens.space[2] }} />
          <Button title="Danger" variant="danger" onPress={() => {}} />
          <Box style={{ height: tokens.space[2] }} />
          <Button title="Loading" loading />
          <Box style={{ height: tokens.space[2] }} />
          <Button title="Disabled" disabled />
        </Box>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bg,
    padding: tokens.space[4],
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space[4],
    borderWidth: 1,
    borderColor: tokens.color.border,
    gap: tokens.space[2],
  },
});
