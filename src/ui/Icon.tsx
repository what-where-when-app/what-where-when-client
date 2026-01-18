import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export type IconName =
    | "arrow-left"
    | "edit"
    | "heart"
    | "user"
    | "x"
    | "plus"
    | "minus"
    | "copy"
    | "eye"
    | "eye-off"
    | "chevron-right";

type Props = {
    name: IconName;
    size?: number;
    color?: string;
};

export function Icon({ name, size = 20, color = colors.highlight.darkest }: Readonly<Props>) {
    if (name === "heart") {
        return <Ionicons name="heart-outline" size={size} color={color} />;
    }

    return <Feather name={name as any} size={size} color={color} />;
}
