import React from "react";
import { Pressable, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { tokens } from "../theme/tokens";
import { Text } from "./primitives";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
                           title,
                           onPress,
                           variant = "primary",
                           size = "md",
                           disabled,
                           loading,
                       }: {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
}) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                variantStyle[variant],
                sizeStyle[size],
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator />
            ) : (
                <Text style={textStyle[variant]}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: tokens.radius.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    } satisfies ViewStyle,
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
});

const sizeStyle = StyleSheet.create({
    sm: { paddingVertical: tokens.space[2], paddingHorizontal: tokens.space[3] },
    md: { paddingVertical: tokens.space[3], paddingHorizontal: tokens.space[4] },
    lg: { paddingVertical: tokens.space[4], paddingHorizontal: tokens.space[5] },
} satisfies Record<Size, ViewStyle>);

const variantStyle = StyleSheet.create({
    primary: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
    secondary: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border },
    ghost: { backgroundColor: "transparent", borderColor: "transparent" },
    danger: { backgroundColor: tokens.color.danger, borderColor: tokens.color.danger },
} satisfies Record<Variant, ViewStyle>);

const textStyle = StyleSheet.create({
    primary: { color: "#fff", fontWeight: tokens.font.weight.medium },
    secondary: { color: tokens.color.text, fontWeight: tokens.font.weight.medium },
    ghost: { color: tokens.color.text, fontWeight: tokens.font.weight.medium },
    danger: { color: "#fff", fontWeight: tokens.font.weight.medium },
} satisfies Record<Variant, TextStyle>);
