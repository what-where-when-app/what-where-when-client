import React from "react";
import { View } from "react-native";
import { Checkbox } from "whatwherewhen-ds/src/ui/Checkbox";
import { Text } from "whatwherewhen-ds/src/ui/Text";

export function States() {
    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Checkbox checked={false} onChange={() => {}} />
                <Text variant="bodyM">Remember me</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Checkbox checked={true} onChange={() => {}} />
                <Text variant="bodyM">Subscribe to newsletter</Text>
            </View>
        </View>
    );
}

export function List() {
    return (
        <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Checkbox checked={true} onChange={() => {}} />
                <Text variant="bodyM">Buy tickets for trivia night</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Checkbox checked={false} onChange={() => {}} />
                <Text variant="bodyM">Invite teammates</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Checkbox checked={false} onChange={() => {}} />
                <Text variant="bodyM">Reserve a table</Text>
            </View>
        </View>
    );
}
