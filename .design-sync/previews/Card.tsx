import React from "react";
import { View } from "react-native";
import { Card } from "whatwherewhen-ds/src/ui/Card";

export function Default() {
    return (
        <View style={{ width: 320 }}>
            <Card
                title="Weekly trivia night"
                subtitle="Fridays · 8:00 PM"
                description="Join up to 8 players and battle it out across 5 rounds of general knowledge."
                tag="NEW"
                buttonTitle="Join game"
                onButtonPress={() => {}}
            />
        </View>
    );
}

export function Minimal() {
    return (
        <View style={{ width: 320 }}>
            <Card title="Quick match" subtitle="2 players · 3 rounds" />
        </View>
    );
}
