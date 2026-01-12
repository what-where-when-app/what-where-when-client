import React from "react";
import {
    View,
    StyleSheet,
    Image,
    ImageSourcePropType,
    Pressable,
    ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";
import { Button } from "./Button";

type Props = {
    title: string;
    subtitle?: string;

    leftImage?: ImageSourcePropType;
    leftIcon?: React.ReactNode;

    rightButtonTitle?: string;
    onRightButtonPress?: () => void;

    showChevron?: boolean;

    onPress?: () => void;
    style?: ViewStyle;
};

export function CardRow({
                            title,
                            subtitle,
                            leftImage,
                            leftIcon,
                            rightButtonTitle,
                            onRightButtonPress,
                            showChevron,
                            onPress,
                            style,
                        }: Readonly<Props>) {
    const Wrapper: any = onPress ? Pressable : View;

    return (
        <Wrapper style={[styles.row, style]} onPress={onPress}>
            <View style={styles.left}>
                {leftImage ? (
                    <Image source={leftImage} style={styles.leftImg} resizeMode="cover" />
                ) : (
                    <View style={styles.leftIconWrap}>{leftIcon}</View>
                )}
            </View>

            <View style={styles.middle}>
                <Text variant="h4">{title}</Text>
                {subtitle ? <Text variant="bodyS" style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

            <View style={styles.right}>
                {rightButtonTitle ? (
                    <Button
                        title={rightButtonTitle}
                        variant="secondary"
                        onPress={onRightButtonPress}
                    />
                ) : showChevron ? (
                    <Text variant="h4" style={styles.chevron}>
                        ›
                    </Text>
                ) : null}
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: colors.neutralLight.light,
        borderRadius: metrics.radius.lg,
        padding: metrics.space[3],
        flexDirection: "row",
        alignItems: "center",
        gap: metrics.space[3],
    } satisfies ViewStyle,

    left: {},
    leftImg: { width: 44, height: 44, borderRadius: 12 },

    leftIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.neutralLight.medium,
        alignItems: "center",
        justifyContent: "center",
    },

    middle: { flex: 1 },

    subtitle: { marginTop: 2, color: colors.neutralDark.light },

    right: {
        alignItems: "flex-end",
        justifyContent: "center",
    },

    chevron: {
        color: colors.neutralDark.light,
        fontSize: 22,
        lineHeight: 22,
    },
});
