import React from "react";
import { View } from "react-native";
import {Tag} from "@/src/ui/Tag";

export default function Screen() {
    return (
        <View style={{ padding: 16 }}>

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <Tag text="TAG" variant="light" />
                <Tag text="TAG" variant="solid" />
            </View>
        </View>
    )
}
