import React, {useState} from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Button } from "../../src/ui/Button";
import { Text } from "../../src/ui/Text";
import { colors } from "../../src/theme/colors";
import {Feather} from "@expo/vector-icons";
import {ListItem} from "@/src/ui/ListItem";
import {NumberInput} from "@/src/ui/NumberInput";
import {Icon} from "@/src/ui/Icon";
import {Tag} from "@/src/ui/Tag";

export default function Screen() {

    const [v, setV] = useState(60);
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
        <Feather name="arrow-left" size={24} color="#006FFD" />

          <NumberInput
              title="Time to think (sec)"
              value={v}
              min={0}
              max={999}
              onChange={setV}
          />

          <ListItem
              title="Title"
              description="Description. Lorem ipsum dolor sit amet..."
              left={<Icon name="edit" />}
              right={<Icon name="chevron-right" />}
          />

          <ListItem
              title="Title"
              description="Description..."
              left={<Icon name="edit" />}
              right={<Tag text="9" variant="solid" />}
          />

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
