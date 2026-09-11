import React from "react";
import { View } from "react-native";
import { RadioButton } from "whatwherewhen-ds/src/ui/RadioButton";
import { Text } from "whatwherewhen-ds/src/ui/Text";

export function States() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RadioButton selected={false} />
                <Text variant="bodyM">General knowledge</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RadioButton selected={true} />
                <Text variant="bodyM">Movies &amp; TV</Text>
            </View>
        </View>
    );
}

export function Sizes() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ alignItems: "center", gap: 6 }}>
                <RadioButton selected size="sm" />
                <Text variant="captionM">sm</Text>
            </View>
            <View style={{ alignItems: "center", gap: 6 }}>
                <RadioButton selected size="md" />
                <Text variant="captionM">md</Text>
            </View>
            <View style={{ alignItems: "center", gap: 6 }}>
                <RadioButton selected size="lg" />
                <Text variant="captionM">lg</Text>
            </View>
        </View>
    );
}

export function Disabled() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RadioButton selected={false} disabled />
                <Text variant="muted">Sold out</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RadioButton selected={true} disabled />
                <Text variant="muted">Selected (locked)</Text>
            </View>
        </View>
    );
}
