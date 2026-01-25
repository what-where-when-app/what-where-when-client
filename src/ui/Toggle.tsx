import React from "react";
import { Pressable, View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/src/theme/colors";

type Props = {
    value: boolean;
    onValueChange: (v: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;

    size?: "md" | "sm";
};

export function Toggle({
                           value,
                           onValueChange,
                           disabled,
                           style,
                           size = "md",
                       }: Readonly<Props>) {
    const s = sizeStyles[size];

    return (
        <Pressable
            disabled={disabled}
            onPress={() => onValueChange(!value)}
            style={[
                styles.track,
                s.track,
                {
                    backgroundColor: value ? colors.highlight.darkest : colors.neutralLight.medium,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
        >
            <View
                style={[
                    styles.thumb,
                    s.thumb,
                    {
                        backgroundColor: colors.neutralLight.lightest,
                        transform: [{ translateX: value ? s.translateOn : s.translateOff }],
                    },
                ]}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    track: {
        justifyContent: "center",
        padding: 4,
        borderRadius: 999,
    },
    thumb: {
        borderRadius: 999,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
});

const sizeStyles = {
    md: {
        track: { width: 52, height: 32 },
        thumb: { width: 28, height: 28 },
        translateOff: 0,
        translateOn: 20,
    },
    sm: {
        track: { width: 45, height: 28 },
        thumb: { width: 20, height: 20 },
        translateOff: 0,
        translateOn: 17,
    },
} as const;
