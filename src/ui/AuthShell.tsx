import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors } from "../theme/colors";

export function AuthShell({ children, style, ...rest }: ViewProps) {
    return (
        <View style={[styles.root, style]} {...rest}>
            <View style={styles.center}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.neutralLight.lightest },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
});
