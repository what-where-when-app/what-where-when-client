import React from "react";
import { ViewStyle } from "react-native";
import { ListItem } from "./ListItem";
import {Toggle} from "@/src/ui/Toggle";

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
                <Toggle
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    size="sm"
                />
            }
        />
    );
}
