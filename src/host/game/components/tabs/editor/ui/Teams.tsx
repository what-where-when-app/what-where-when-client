import React, { useState, useEffect } from "react";
import { Pressable, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { Tag } from "@/src/ui/Tag";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import { UITeam, UICategory } from "@/src/host/game/components/tabs/editor/types";
import { Button } from "@/src/ui/Button";

export function TeamsSection({
                                 teams,
                                 categories,
                                 onAdd,
                                 onRemove,
                             }: {
    teams: UITeam[];
    categories: UICategory[];
    onAdd: (name: string, code: string, categoryId: number | null) => void;
    onRemove: (t: UITeam) => void;
}) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

    const validCategories = categories.filter(c => c.id != null);

    useEffect(() => {
        if (!selectedCatId && validCategories.length > 0) {
            setSelectedCatId(validCategories[0].id!);
        }
    }, [categories, selectedCatId, validCategories]);

    const isReadyToAdd = name.trim().length > 0 && code.trim().length > 0 && selectedCatId !== null;

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text variant="h3" style={{ paddingVertical: 20 }}>Команды</Text>

            <View style={{ gap: 16, paddingBottom: 20 }}>

                <Text variant="captionM" style={{ color: colors.neutralDark.medium }}>Лига / Категория</Text>

                {validCategories.length === 0 ? (
                    <Text variant="bodyM" style={{ color: colors.warning.dark }}>
                        Сначала создайте и сохраните хотя бы одну категорию, чтобы добавлять команды.
                    </Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                        {validCategories.map(c => {
                            const isActive = selectedCatId === c.id;
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedCatId(c.id!)}
                                    style={[styles.catChip, isActive && styles.catChipActive]}
                                >
                                    <Text style={{
                                        color: isActive ? '#fff' : colors.neutralDark.medium,
                                        fontWeight: isActive ? 'bold' : 'normal'
                                    }}>
                                        {c.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {categories.some(c => c.id == null) && (
                            <View style={[styles.catChip, { backgroundColor: 'transparent', borderColor: colors.neutralLight.medium, borderStyle: 'dashed' }]}>
                                <Text style={{ color: colors.neutralDark.light, fontSize: 12 }}>
                                    Сохраните игру, чтобы использовать новые категории
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <TextField value={name} placeholder="Название команды" onChangeText={setName} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <TextField value={code} placeholder="Код команды" onChangeText={setCode} />
                    </View>

                    <View style={{ flex: 1, alignSelf: "center" }}>
                        <Button
                            title={"Добавить команду"}
                            variant="secondary"
                            onPress={() => {
                                if (!isReadyToAdd) return;
                                onAdd(name, code, selectedCatId);
                                setName("");
                                setCode("");
                            }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                    {teams.map((t: any) => {

                        const actualCategoryId = t.category_id || t.categoryId;

                        const catName = categories.find(c => c.id != null && c.id === actualCategoryId)?.name;

                        const displayText = catName
                            ? `${t.name} (${catName})`
                            : t.name;

                        return (
                            <View key={t.id ? `team_${t.id}` : t._tmpId!} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Tag
                                    text={displayText.toUpperCase()}
                                    variant="light"
                                    rightIcon={
                                        <Pressable onPress={() => onRemove(t)} hitSlop={10}>
                                            <Icon name="x" size={12} color={colors.neutralDark.dark} />
                                        </Pressable>
                                    }
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.neutralLight.medium,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center'
    },
    catChipActive: {
        backgroundColor: colors.highlight.darkest,
        borderColor: colors.highlight.darkest,
    }
});