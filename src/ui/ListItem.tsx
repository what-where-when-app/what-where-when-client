import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";

type Props = {
    title: string;
    description?: string;

    left?: React.ReactNode;
    right?: React.ReactNode;

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
                         }: Props) {
    const Root: any = onPress ? Pressable : View;

    return (
        <Root
            onPress={onPress}
            style={[styles.root, style]}
        >
            {left ? <View style={styles.left}>{left}</View> : null}

            <View style={styles.mid}>
                <Text variant="bodyS" style={styles.title}>{title}</Text>
                {description ? (
                    <Text variant="captionM" style={styles.desc}>
                        {description}
                    </Text>
                ) : null}
            </View>

            {right ? <View style={styles.right}>{right}</View> : null}
        </Root>
    );
}

const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: metrics.radius.lg,
        backgroundColor: colors.neutralLight.lightest,
    },
    left: { width: 34, alignItems: "center", justifyContent: "center" },
    mid: { flex: 1, gap: 2 },
    right: { minWidth: 34, alignItems: "center", justifyContent: "center" },
    title: { color: colors.neutralDark.darkest, fontWeight: "600" as any },
    desc: { color: colors.neutralDark.light },
});
