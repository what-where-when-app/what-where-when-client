import React from "react";
import {
    View,
    StyleSheet,
    Image,
    ImageSourcePropType,
    ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";
import { Button } from "./Button";
import {Tag} from "@/src/ui/Tag";

type Props = {
    title?: string;
    subtitle?: string;
    description?: string;

    headerImage?: ImageSourcePropType;
    headerVisual?: React.ReactNode;

    tag?: string;

    buttonTitle?: string;
    onButtonPress?: () => void;

    style?: ViewStyle;
};

export function Card({
                         title,
                         subtitle,
                         description,
                         headerImage,
                         headerVisual,
                         tag,
                         buttonTitle,
                         onButtonPress,
                         style,
                     }: Readonly<Props>) {
    return (
        <View style={[styles.card, style]}>
            {(headerImage || headerVisual || tag) && (
                <View style={styles.header}>
                    {headerImage ? (
                        <Image source={headerImage} style={styles.headerImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.headerVisualWrap}>{headerVisual}</View>
                    )}

                    {tag ? (
                        <View style={styles.tagPos}>
                            <Tag text={tag} variant="solid" />
                        </View>
                    ) : null}
                </View>
            )}

            <View style={styles.body}>
                {title ? <Text variant="h4">{title}</Text> : null}
                {subtitle ? <Text variant="bodyS" style={styles.subtitle}>{subtitle}</Text> : null}
                {description ? (
                    <Text variant="bodyS" style={styles.description}>
                        {description}
                    </Text>
                ) : null}

                {buttonTitle ? (
                    <View style={{ marginTop: metrics.space[3] }}>
                        <Button
                            title={buttonTitle}
                            variant="secondary"
                            onPress={onButtonPress}
                        />
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.neutralLight.light,
        borderRadius: metrics.radius.lg,
        overflow: "hidden",
    } satisfies ViewStyle,

    header: {
        position: "relative",
        height: 92,
        backgroundColor: colors.neutralLight.medium,
        justifyContent: "center",
        alignItems: "center",
    } satisfies ViewStyle,

    headerImage: {
        width: "100%",
        height: "100%",
    },

    headerVisualWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.highlight.light,
        alignItems: "center",
        justifyContent: "center",
    },

    tag: {
        position: "absolute",
        top: metrics.space[3],
        right: metrics.space[3],
        backgroundColor: colors.highlight.darkest,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    tagPos: {
        position: "absolute",
        top: metrics.space[3],
        right: metrics.space[3],
    },

    body: {
        padding: metrics.space[4],
    },

    subtitle: {
        marginTop: 2,
        color: colors.neutralDark.light,
    },

    description: {
        marginTop: metrics.space[2],
        color: colors.neutralDark.light,
    },
});
