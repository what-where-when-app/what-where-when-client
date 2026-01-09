import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export function Checkbox({
    checked,
    onChange,
}: Readonly<{
    checked: boolean;
    onChange: (next: boolean) => void;
}>) {
    return (
        <Pressable onPress={() => onChange(!checked)} style={styles.row}>
            <View style={[styles.box, checked && styles.boxChecked]}>
                {checked ? <View style={styles.dot} /> : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: { padding: 2 },
    box: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.neutralLight.dark,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.neutralLight.lightest,
    },
    boxChecked: {
        borderColor: colors.highlight.darkest,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 3,
        backgroundColor: colors.highlight.darkest,
    },
});
