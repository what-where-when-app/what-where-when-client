import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { ListItem } from "@/src/ui/ListItem";
import { Tag } from "@/src/ui/Tag";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import {UICategory} from "@/src/host/game/editor/types";
import {Button} from "@/src/ui/Button";

export function CategoriesSection({
                                      categories,
                                      onAdd,
                                      onRemove,
                                  }: {
    categories: UICategory[];
    onAdd: (name: string, description?: string) => void;
    onRemove: (c: UICategory) => void;
}) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text variant="h3" style={{ paddingVertical: 20 }}>Categories</Text>

            <View style={{ paddingVertical: 20, gap: 16 }}>

                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <TextField value={name} placeholder="eg. Graduates" onChangeText={setName} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <TextField value={desc} placeholder="Description" onChangeText={setDesc} />
                    </View>

                    <View style={{ flex: 1, alignSelf: "center" }}>
                        <Button
                            title={"Add category"}
                            variant="tertiary"
                            onPress={() => {
                                onAdd(name, desc);
                                setName("");
                                setDesc("");
                            }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {categories.map((t) => (
                        <View key={t.id ? `team_${t.id}` : t._tmpId!} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Tag text={t.name.toUpperCase()} variant="light"
                                 rightIcon={
                                     <Pressable onPress={() => onRemove(t)} hitSlop={10}>
                                         <Icon name="x" size={12} color={colors.neutralDark.dark} />
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
