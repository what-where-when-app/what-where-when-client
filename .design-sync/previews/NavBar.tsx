import React from "react";
import { View } from "react-native";
import { NavBar } from "whatwherewhen-ds/src/ui/NavBar";

export function BackAndAction() {
    return (
        <View style={{ gap: 12, width: 560 }}>
            <NavBar
                title="Game Lobby"
                leftText="Back"
                onLeftPress={() => {}}
                rightText="Edit"
                onRightPress={() => {}}
            />
        </View>
    );
}

export function TitleOnly() {
    return (
        <View style={{ gap: 12, width: 560 }}>
            <NavBar title="Leaderboard" />
        </View>
    );
}

export function BackOnly() {
    return (
        <View style={{ gap: 12, width: 560 }}>
            <NavBar title="Round 3 of 5" leftText="Back" onLeftPress={() => {}} />
        </View>
    );
}
