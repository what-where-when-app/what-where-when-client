import React from "react";
import { View } from "react-native";
import { TimerBar } from "whatwherewhen-ds/src/ui/TimerBar";

export function Healthy() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <TimerBar timeLeft={80} totalTime={100} />
        </View>
    );
}

export function Warning() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <TimerBar timeLeft={30} totalTime={100} />
        </View>
    );
}

export function Critical() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <TimerBar timeLeft={10} totalTime={100} />
        </View>
    );
}
