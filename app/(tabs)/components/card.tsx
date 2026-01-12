import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {Card} from "@/src/ui/Card";
import {CardRow} from "@/src/ui/CardRow";
import {TextField} from "@/src/ui/TextField";
import {Text} from "@/src/ui/Text";

export default function ComponentsScreen() {
    const [value, setValue] = useState("");

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <Text variant="h2">Cards</Text>

            <Card
                tag="TAG"
                title="Title"
                subtitle="Subtitle"
                description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit."
                buttonTitle="Button"
                onButtonPress={() => {}}
                headerVisual={<Text variant="h4">★</Text>}
            />

            <Card
                title="Title"
                subtitle="Subtitle"
                description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit."
                buttonTitle="Button"
                onButtonPress={() => {}}
                headerVisual={<Text variant="h4">♥</Text>}
            />

            <Card
                title="Title"
                subtitle="Subtitle"
                buttonTitle="Button"
                onButtonPress={() => {}}
            />

            <Text variant="h2">Rows</Text>

            <CardRow title="Title" subtitle="Subtitle" leftIcon={<Text variant="h4">▦</Text>} rightButtonTitle="Button" />
            <CardRow title="Title" subtitle="Subtitle" leftIcon={<Text variant="h4">▦</Text>} showChevron onPress={() => {}} />
            <CardRow title="Title" subtitle="Subtitle" leftIcon={<Text variant="h4">▦</Text>} />

            <Text variant="h2">TextField</Text>
            <TextField label="Title" value={value} onChangeText={setValue} placeholder="Placeholder" helperText="Support text" />
        </ScrollView>
    );
}
