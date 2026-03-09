import React from "react";
import { Pressable, View, Platform } from "react-native";
import { TextField } from "@/src/ui/TextField";
import { ListItem } from "@/src/ui/ListItem";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";

export function GameMetaRow({ title, date_of_event, passcode, onChangeTitle, onChangeDate }: {
    title: string;
    date_of_event: string;
    passcode?: string | null;
    onChangeTitle: (v: string) => void;
    onChangeDate: (v: string) => void;
}) {

    const getNativeDateValue = () => {
        if (!date_of_event || !date_of_event.includes('-')) return '';
        const [d, m, y] = date_of_event.split('-');
        return `${y}-${m}-${d}`;
    };

    const handleNativeDateChange = (val: string) => {
        if (!val) return;
        const [y, m, d] = val.split('-');
        onChangeDate(`${d}-${m}-${y}`);
    };

    return (
        <View style={{ flexDirection: "row", gap: 40, alignItems: "flex-start", paddingHorizontal: 16 }}>
            <View style={{ flex: 1.5 }}>
                <TextField
                    label="Название игры"
                    value={title}
                    placeholder="Введите название..."
                    onChangeText={onChangeTitle}
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text variant="captionM" style={{ marginBottom: 8, color: colors.neutralDark.medium }}>
                    Дата проведения
                </Text>

                {Platform.OS === 'web' ? (
                    <input
                        type="date"
                        value={getNativeDateValue()}
                        onChange={(e) => handleNativeDateChange(e.target.value)}
                        style={{
                            height: 44,
                            padding: '0 12px',
                            borderRadius: 8,
                            border: `1px solid ${colors.neutralLight.darkest}`,
                            backgroundColor: colors.neutralLight.lightest,
                            color: colors.neutralDark.darkest,
                            fontSize: 14,
                            outline: 'none',
                            fontFamily: 'inherit',
                            width: '100%'
                        }}
                    />
                ) : (
                    <TextField
                        value={date_of_event}
                        placeholder="23-01-2026"
                        onChangeText={onChangeDate}
                    />
                )}
            </View>

            <View style={{ flex: 1.2, alignSelf: "center" }}>
                {passcode && (
                    <ListItem
                        variant="highlight"
                        title={passcode}
                        description="Код для входа команд"
                        right={
                            <Pressable onPress={() => {}}>
                                <Icon name="copy" color={colors.highlight.darkest} />
                            </Pressable>
                        }
                    />
                )}
            </View>
        </View>
    );
}

import { Text } from "@/src/ui/Text";