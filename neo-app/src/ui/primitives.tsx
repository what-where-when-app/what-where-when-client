import React from "react";
import { View, Text as RNText, ViewProps, TextProps, StyleSheet } from "react-native";
import { tokens } from "../theme/tokens";

export function Box(props: ViewProps) {
    return <View {...props} />;
}

export function Text(
    props: TextProps & { variant?: "body" | "muted" | "title" | "caption" }
) {
    const { style, variant = "body", ...rest } = props;
    return <RNText {...rest} style={[styles.base, variantStyles[variant], style]} />;
}

const styles = StyleSheet.create({
    base: {
        color: tokens.color.text,
        fontSize: tokens.font.size.md,
    },
});

const variantStyles = StyleSheet.create({
    body: {},
    muted: { color: tokens.color.muted },
    title: {
        fontSize: tokens.font.size.xl,
        fontWeight: tokens.font.weight.bold,
    },
    caption: {
        fontSize: tokens.font.size.sm,
        color: tokens.color.muted,
    },
});
