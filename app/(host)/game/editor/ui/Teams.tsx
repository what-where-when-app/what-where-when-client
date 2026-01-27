import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { ListItem } from "@/src/ui/ListItem";
import { Tag } from "@/src/ui/Tag";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import {UITeam} from "@/app/(host)/game/editor/types";
import {Button} from "@/src/ui/Button";

export function TeamsSection({
                                 teams,
                                 onAdd,
                                 onRemove,
                             }: {
    teams: UITeam[];
    onAdd: (name: string, code: string) => void;
    onRemove: (t: UITeam) => void;
}) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text variant="h3" style={{ paddingVertical: 20 }}>Teams</Text>

            <View style={{ gap: 16, paddingVertical: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <TextField value={name} placeholder="Team name" onChangeText={setName} />
                    </View>

                    <View style={{ flex: 1}}>
                        <TextField value={code} placeholder="Team code" onChangeText={setCode} />
                    </View>

                    <View style={{ flex: 1, alignSelf: "center" }}>
                        <Button
                            title={"Add category"}
                            variant="tertiary"
                            onPress={() => {
                                onAdd(name, code);
                                setName("");
                                setCode("");
                            }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {teams.map((t) => (
                        <View key={t.id ? `team_${t.id}` : t._tmpId!} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Tag text={t.name.toUpperCase()} variant="light"
                                rightIcon={
                                    <Pressable onPress={() => onRemove(t)} hitSlop={10}>
                                        <Icon name="x" size={12} />
                                    </Pressable>
                                }
                            />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
