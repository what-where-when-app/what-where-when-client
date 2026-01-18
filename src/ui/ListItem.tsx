import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";

type ListItemVariant = "default" | "highlight";

type Props = {
    title: string;
    description?: string;

    left?: React.ReactNode;
    right?: React.ReactNode;

    variant?: ListItemVariant;

    onPress?: () => void;
    style?: ViewStyle;
};


export function ListItem({
                             title,
                             description,
                             left,
                             right,
                             onPress,
                             style,
                             variant = "default",
                         }: Readonly<Props>) {
    const Root: any = onPress ? Pressable : View;

    return (
        <Root
            onPress={onPress}
            style={[
                styles.root,
                variantStyles[variant],
                style]}
        >
            {left ? <View style={styles.left}>{left}</View> : null}

            <View style={styles.mid}>
                <Text variant="bodyM" style={styles.title}>
                    {title}
                </Text>

                {description ? (
                    <Text variant="bodyS" style={styles.desc}>
                        {description}
                    </Text>
                ) : null}
            </View>

            {right ? <View style={styles.right}>{right}</View> : null}
        </Root>
    );
}

const variantStyles = StyleSheet.create({
    default: {
        backgroundColor: colors.neutralLight.lightest,
    },
    highlight: {
        backgroundColor: colors.highlight.lightest,
    },
});

const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: metrics.radius.lg,
        backgroundColor: colors.neutralLight.lightest,
        gap: 16
    },
    left: { width: 34, alignItems: "center", justifyContent: "center" },
    mid: { flex: 1, gap: 4 },
    right: { minWidth: 34, alignItems: "center", justifyContent: "center" },
    title: { color: colors.neutralDark.darkest},
    desc: { color: colors.neutralDark.light },
});
