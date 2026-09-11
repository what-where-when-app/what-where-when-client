import React from "react";
import { View } from "react-native";
import { Tag } from "whatwherewhen-ds/src/ui/Tag";

export function Variants() {
    return (
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Tag text="New" variant="light" />
            <Tag text="Live" variant="solid" />
        </View>
    );
}

export function WithIcon() {
    return (
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Tag
                text="Trending"
                variant="light"
                leftIcon={
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#006FFD",
                        }}
                    />
                }
            />
            <Tag
                text="Sold out"
                variant="solid"
                leftIcon={
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FFFFFF",
                        }}
                    />
                }
            />
        </View>
    );
}
