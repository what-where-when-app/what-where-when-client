import React from "react";
import { View } from "react-native";
import { Bullet } from "whatwherewhen-ds/src/ui/Bullet";

export function Variants() {
    return (
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <Bullet value={7} variant="plain" />
            <Bullet value={7} variant="light" />
            <Bullet value={7} variant="primary" />
        </View>
    );
}

export function Sizes() {
    return (
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <Bullet value={1} variant="primary" size="sm" />
            <Bullet value={2} variant="primary" size="md" />
            <Bullet value={3} variant="primary" size="lg" />
        </View>
    );
}
