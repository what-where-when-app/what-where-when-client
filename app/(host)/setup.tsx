import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "../../src/ui/Text";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { TextField } from "../../src/ui/TextField";
import { Tag } from "../../src/ui/Tag";

export default function SetupScreen() {
    const [catName, setCatName] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [teamName, setTeamName] = useState("");
    const [teamCode, setTeamCode] = useState("");

    const [categories, setCategories] = useState<string[]>(["CATEGORY", "CATEGORY"]);
    const [teams, setTeams] = useState<string[]>(["TEAM NAME", "TEAM NAME"]);

    const cards = useMemo(
        () =>
            Array.from({ length: 11 }).map((_, i) => ({
                title: "Title",
                subtitle: "Subtitle",
                id: i + 1,
            })),
        []
    );

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }}>
            {/* Top bar */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="bodyS" style={{ color: "#006FFD" }}>Logout</Text>
                <Text variant="h2">Game setup</Text>
                <Text variant="bodyS" style={{ color: "#006FFD" }}>Create game</Text>
            </View>

            {/* Cards grid */}
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 18,
                    justifyContent: "center",
                    marginTop: 12,
                }}
            >
                {cards.map((c, idx) => (
                    <View key={c.id} style={{ width: 220 }}>
                        <Card
                            title={c.title}
                            subtitle={c.subtitle}
                            // первая карточка с "Game is ongoing" можно сделать отдельной логикой
                            description={idx === 0 ? "" : undefined}
                            buttonTitle={idx === 0 ? undefined : "Button"}
                            headerVisual={null}
                        />
                        {idx === 0 ? (
                            <View style={{ marginTop: 12 }}>
                                <Tag text="Game is ongoing" variant="light" rightIcon={<Text variant="captionM">●</Text>} />
                            </View>
                        ) : null}
                    </View>
                ))}
            </View>

            {/* Categories */}
            <View style={{ alignItems: "center", marginTop: 24, gap: 12 }}>
                <Text variant="h3">Categories</Text>

                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    <View style={{ width: 260 }}>
                        <TextField value={catName} onChangeText={setCatName} placeholder="eg. Graduates" />
                    </View>
                    <View style={{ width: 260 }}>
                        <TextField value={catDesc} onChangeText={setCatDesc} placeholder="Description" />
                    </View>

                    <Text variant="bodyS" style={{ color: "#006FFD" }}
                          onPress={() => {
                              if (!catName.trim()) return;
                              setCategories((prev) => [catName.trim().toUpperCase(), ...prev]);
                              setCatName("");
                              setCatDesc("");
                          }}
                    >
                        Add category
                    </Text>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                    {categories.map((t, i) => (
                        <Tag
                            key={i}
                            text={t}
                            variant="light"
                            leftIcon={<Text variant="captionM">✎</Text>}
                            rightIcon={<Text variant="captionM">×</Text>}
                        />
                    ))}
                </View>
            </View>

            {/* Teams */}
            <View style={{ alignItems: "center", marginTop: 24, gap: 12 }}>
                <Text variant="h3">Teams</Text>

                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    <View style={{ width: 260 }}>
                        <TextField value={teamName} onChangeText={setTeamName} placeholder="Team name" />
                    </View>
                    <View style={{ width: 260 }}>
                        <TextField value={teamCode} onChangeText={setTeamCode} placeholder="Team code" />
                    </View>

                    <Text
                        variant="bodyS"
                        style={{ color: "#006FFD" }}
                        onPress={() => {
                            if (!teamName.trim()) return;
                            setTeams((prev) => [teamName.trim().toUpperCase(), ...prev]);
                            setTeamName("");
                            setTeamCode("");
                        }}
                    >
                        Add team
                    </Text>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                    {teams.map((t, i) => (
                        <Tag
                            key={i}
                            text={t}
                            variant="light"
                            leftIcon={<Text variant="captionM">✎</Text>}
                            rightIcon={<Text variant="captionM">×</Text>}
                        />
                    ))}
                </View>
            </View>

            {/* bottom spacing */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
