import React from "react";
import { View } from "react-native";
import { TextField } from "whatwherewhen-ds/src/ui/TextField";

export function Default() {
    return (
        <View style={{ width: 320 }}>
            <TextField
                label="Email"
                value="player@example.com"
                onChangeText={() => {}}
                placeholder="you@example.com"
                helperText="We'll send your game invites here."
            />
        </View>
    );
}

export function Error() {
    return (
        <View style={{ width: 320 }}>
            <TextField
                label="Email"
                value="player@example"
                onChangeText={() => {}}
                errorText="Enter a valid email address."
            />
        </View>
    );
}

export function Disabled() {
    return (
        <View style={{ width: 320 }}>
            <TextField
                label="Team name"
                value="The Quizzards"
                onChangeText={() => {}}
                disabled
                helperText="Team name can't be changed mid-season."
            />
        </View>
    );
}
