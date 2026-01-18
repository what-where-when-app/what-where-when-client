import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";
import { Icon } from "./Icon";

type Props = {
    value: number;
    onChange: (next: number) => void;

    step?: number;
    min?: number;
    max?: number;

    title?: string;
    supportText?: string;

    disabled?: boolean;
    error?: boolean;

    style?: ViewStyle;
};

export function NumberInput({
                                value,
                                onChange,
                                step = 1,
                                min,
                                max,
                                title,
                                supportText,
                                disabled = false,
                                error = false,
                                style,
                            }: Readonly<Props>) {
    const canDec = !disabled && (min === undefined || value - step >= min);
    const canInc = !disabled && (max === undefined || value + step <= max);

    const valueColor = disabled
        ? colors.neutralDark.lightest
        : error
            ? colors.error.dark
            : colors.neutralDark.darkest;

    return (
        <View style={[styles.wrap, style]}>
            {(title || supportText) ? (
                <View style={styles.left}>
                    {title ? <Text variant="bodyS" style={styles.title}>{title}</Text> : null}
                    {supportText ? (
                        <Text
                            variant="captionM"
                            style={{ color: error ? colors.error.dark : colors.neutralDark.light }}
                        >
                            {supportText}
                        </Text>
                    ) : null}
                </View>
            ) : null}

            <View style={styles.controls}>
                <CircleButton
                    icon="minus"
                    disabled={!canDec}
                    onPress={() => onChange(value - step)}
                />
                <Text variant="bodyM" style={{ color: valueColor, minWidth: 36, textAlign: "center" }}>
                    {value}
                </Text>
                <CircleButton
                    icon="plus"
                    disabled={!canInc}
                    onPress={() => onChange(value + step)}
                />
            </View>
        </View>
    );
}

function CircleButton({
                          icon,
                          disabled,
                          onPress,
                      }: Readonly<{
    icon: "minus" | "plus";
    disabled: boolean;
    onPress: () => void;
}>) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.circle,
                { opacity: disabled ? 0.35 : 1 },
            ]}
            hitSlop={10}
        >
            <Icon name={icon} size={10} color={colors.highlight.darkest} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: metrics.space[4],
    },
    left: { flex: 1, gap: 4 },
    title: { color: colors.neutralDark.darkest, fontWeight: "600" as any },
    controls: { flexDirection: "row", alignItems: "center", gap: 6 },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 999,
        backgroundColor: colors.highlight.lightest,
        alignItems: "center",
        justifyContent: "center",
    },
});
