import React from "react";
import { View } from "react-native";
import { Text } from "whatwherewhen-ds/src/ui/Text";

export function Headings() {
    return (
        <View style={{ gap: 8 }}>
            <Text variant="h1">Heading One</Text>
            <Text variant="h2">Heading Two</Text>
            <Text variant="h3">Heading Three</Text>
            <Text variant="h4">Heading Four</Text>
            <Text variant="h5">Heading Five</Text>
        </View>
    );
}

export function Body() {
    return (
        <View style={{ gap: 8 }}>
            <Text variant="bodyXL">Body extra large — the quick brown fox jumps over the lazy dog.</Text>
            <Text variant="bodyL">Body large — the quick brown fox jumps over the lazy dog.</Text>
            <Text variant="bodyM">Body medium — the quick brown fox jumps over the lazy dog.</Text>
            <Text variant="bodyS">Body small — the quick brown fox jumps over the lazy dog.</Text>
            <Text variant="bodyXS">Body extra small — the quick brown fox jumps over the lazy dog.</Text>
        </View>
    );
}

export function ActionsAndCaptions() {
    return (
        <View style={{ gap: 8 }}>
            <Text variant="actionL">Action Large</Text>
            <Text variant="actionM">Action Medium</Text>
            <Text variant="actionS">Action Small</Text>
            <Text variant="captionM">Caption medium text</Text>
            <Text variant="muted">Muted supporting text</Text>
        </View>
    );
}
