import React from "react";
import { View, ViewProps, ViewStyle, ColorValue } from "react-native";
import { colors } from "@/src/theme/colors";
import { metrics } from "@/src/theme/metrics";

type SpaceKey = keyof typeof metrics.space;
type RadiusKey = keyof typeof metrics.radius & string;

type ColorGroup = keyof typeof colors & string;
type ColorPath = {
    [G in ColorGroup]: `${G}.${keyof typeof colors[G] & string}`
}[ColorGroup];

interface BoxCustomProps {
    p?: SpaceKey;
    px?: SpaceKey;
    py?: SpaceKey;
    pt?: SpaceKey;
    pb?: SpaceKey;
    m?: SpaceKey;
    mt?: SpaceKey;
    mb?: SpaceKey;
    gap?: SpaceKey;
    radius?: RadiusKey;
    bg?: ColorPath | string;
    flex?: number;
    row?: boolean;
    align?: ViewStyle['alignItems'];
    justify?: ViewStyle['justifyContent'];
    width?: ViewStyle['width'];
    maxWidth?: ViewStyle['maxWidth'];
    height?: ViewStyle['height'];
}

export type BoxProps = ViewProps & BoxCustomProps;

export function Box({
                        p, px, py, pt, pb, m, mt, mb, gap, radius, bg, flex, row, align, justify,
                        width, maxWidth, height,
                        style,
                        children,
                        ...rest
                    }: BoxProps) {

    const getSpace = (key?: SpaceKey) => (key !== undefined ? metrics.space[key] : undefined);
    const getRadius = (key?: RadiusKey) => (key !== undefined ? metrics.radius[key] : undefined);

    const getColor = (path?: string): ColorValue | undefined => {
        if (!path) return undefined;
        if (!path.includes('.')) return path as ColorValue;

        const [group, shade] = path.split('.');
        // @ts-ignore
        return colors[group]?.[shade] || path;
    };

    const boxStyle: ViewStyle = {
        padding: getSpace(p),
        paddingHorizontal: getSpace(px),
        paddingVertical: getSpace(py),
        paddingTop: getSpace(pt),
        paddingBottom: getSpace(pb),
        margin: getSpace(m),
        marginTop: getSpace(mt),
        marginBottom: getSpace(mb),
        gap: getSpace(gap),
        borderRadius: getRadius(radius),
        backgroundColor: getColor(bg),
        flex,
        flexDirection: row ? 'row' : 'column',
        alignItems: align,
        justifyContent: justify,
        width,
        maxWidth,
        height,
    };

    return (
        <View style={[boxStyle, style]} {...rest}>
            {children}
        </View>
    );
}