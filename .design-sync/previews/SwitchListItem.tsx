import React from "react";
import { View } from "react-native";
import { SwitchListItem } from "whatwherewhen-ds/src/ui/SwitchListItem";

export function Default() {
    return (
        <View style={{ width: 340, gap: 12 }}>
            <SwitchListItem
                title="Push notifications"
                description="Get notified when it's your team's turn"
                value={true}
                onValueChange={() => {}}
            />
            <SwitchListItem
                title="Email digest"
                description="Weekly summary of upcoming trivia nights"
                value={false}
                onValueChange={() => {}}
            />
        </View>
    );
}

export function Disabled() {
    return (
        <View style={{ width: 340 }}>
            <SwitchListItem
                title="Location sharing"
                description="Required for nearby game suggestions"
                value={false}
                onValueChange={() => {}}
                disabled
            />
        </View>
    );
}
