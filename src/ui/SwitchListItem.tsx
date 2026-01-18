import React from "react";
import { Switch, ViewStyle } from "react-native";
import { ListItem } from "./ListItem";
import { colors } from "../theme/colors";

type Props = {
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;
};

export function SwitchListItem({
                              title,
                              description,
                              value,
                              onValueChange,
                              disabled,
                              style,
                          }: Readonly<Props>) {
    return (
        <ListItem
            title={title}
            description={description}
            style={style}
            right={
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    trackColor={{
                        false: colors.neutralLight.medium,
                        true: colors.highlight.darkest,
                    }}
                    thumbColor={colors.neutralLight.lightest}
                />
            }
        />
    );
}
