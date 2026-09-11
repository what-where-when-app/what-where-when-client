import React from "react";
import { View, Text as RNText } from "react-native";
import { CardRow } from "whatwherewhen-ds/src/ui/CardRow";

function IconDot({ glyph }: { glyph: string }) {
    return <RNText style={{ fontSize: 20 }}>{glyph}</RNText>;
}

export function WithButton() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <CardRow
                title="Friday Trivia League"
                subtitle="Next round starts in 20 min"
                leftIcon={<IconDot glyph="🎯" />}
                rightButtonTitle="Join"
                onRightButtonPress={() => {}}
            />
        </View>
    );
}

export function WithChevron() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <CardRow
                title="Team Standings"
                subtitle="You're currently ranked #3"
                leftIcon={<IconDot glyph="📊" />}
                showChevron
                onPress={() => {}}
            />
        </View>
    );
}

export function Minimal() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <CardRow title="Game history" subtitle="View your past 12 games" onPress={() => {}} />
        </View>
    );
}
