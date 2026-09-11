import React from "react";
import { View } from "react-native";
import { AuthShell } from "whatwherewhen-ds/src/ui/AuthShell";
import { Text } from "whatwherewhen-ds/src/ui/Text";
import { TextField } from "whatwherewhen-ds/src/ui/TextField";
import { Button } from "whatwherewhen-ds/src/ui/Button";

export function LoginForm() {
    return (
        <View style={{ width: 375, height: 600 }}>
            <AuthShell>
                <View style={{ width: 280, gap: 16 }}>
                    <Text variant="h2">Welcome back</Text>
                    <TextField
                        label="Email"
                        value="player@example.com"
                        onChangeText={() => {}}
                        placeholder="you@example.com"
                    />
                    <TextField
                        label="Password"
                        value="••••••••"
                        onChangeText={() => {}}
                        secureTextEntry
                    />
                    <Button title="Log in" variant="primary" onPress={() => {}} />
                </View>
            </AuthShell>
        </View>
    );
}
