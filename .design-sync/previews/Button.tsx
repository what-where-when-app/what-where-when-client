import React from "react";
import { View } from "react-native";
import { Button } from "whatwherewhen-ds/src/ui/Button";

export function Variants() {
    return (
        <View style={{ gap: 12, alignItems: "flex-start" }}>
            <Button title="Primary action" variant="primary" onPress={() => {}} />
            <Button title="Secondary action" variant="secondary" onPress={() => {}} />
            <Button title="Tertiary action" variant="tertiary" onPress={() => {}} />
        </View>
    );
}

export function States() {
    return (
        <View style={{ gap: 12, alignItems: "flex-start" }}>
            <Button title="Loading" variant="primary" loading onPress={() => {}} />
            <Button title="Disabled" variant="primary" disabled onPress={() => {}} />
        </View>
    );
}
