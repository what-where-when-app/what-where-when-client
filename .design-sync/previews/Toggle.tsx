import React from "react";
import { View } from "react-native";
import { Toggle } from "whatwherewhen-ds/src/ui/Toggle";
import { Text } from "whatwherewhen-ds/src/ui/Text";

export function States() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Toggle value={false} onValueChange={() => {}} />
                <Text variant="bodyM">Off</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Toggle value={true} onValueChange={() => {}} />
                <Text variant="bodyM">On</Text>
            </View>
        </View>
    );
}

export function Sizes() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ alignItems: "center", gap: 6 }}>
                <Toggle value={true} onValueChange={() => {}} size="sm" />
                <Text variant="captionM">sm</Text>
            </View>
            <View style={{ alignItems: "center", gap: 6 }}>
                <Toggle value={true} onValueChange={() => {}} size="md" />
                <Text variant="captionM">md</Text>
            </View>
        </View>
    );
}

export function Disabled() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Toggle value={false} onValueChange={() => {}} disabled />
                <Text variant="bodyM">Off, disabled</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Toggle value={true} onValueChange={() => {}} disabled />
                <Text variant="bodyM">On, disabled</Text>
            </View>
        </View>
    );
}
