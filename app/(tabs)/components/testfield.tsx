import React, { useState } from "react";
import { View } from "react-native";
import {TextField} from "@/src/ui/TextField";

export default function Screen() {
    const [value, setValue] = useState("");

    return (
        <View style={{ padding: 16 }}>
            <TextField
                label="Title"
                value={value}
                onChangeText={setValue}
                placeholder="Placeholder"
                helperText="Support text"
            />

            <View style={{ height: 16 }} />

            <TextField
                label="Title"
                value={value}
                onChangeText={setValue}
                errorText="Error message"
            />

            <View style={{ height: 16 }} />

            <TextField
                label="Price"
                value={value}
                onChangeText={setValue}
                leftUnit="€"
                placeholder="0.00"
            />
        </View>
    );
}
