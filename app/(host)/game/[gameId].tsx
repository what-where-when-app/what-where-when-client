import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { NavBar } from "@/src/ui/NavBar";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { Card } from "@/src/ui/Card";
import { Icon } from "@/src/ui/Icon";

import { colors } from "@/src/theme/colors";
import { metrics } from "@/src/theme/metrics";

import type { HostGameDetails, SaveGameRequest } from "@/src/dto/game.dto";
import { toSaveGameDraft } from "@/src/game/mappers";
import {hostApi} from "@/src/api/host";

export default function GameSetupScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const isNew = gameId === "new";
    const numericGameId = !isNew ? Number(gameId) : null;

    const [loading, setLoading] = useState(!isNew);
    const [loaded, setLoaded] = useState<HostGameDetails | null>(null);

    // draft = то, что реально редактируем и потом отправим в SaveGameRequest.game
    const [draft, setDraft] = useState<SaveGameRequest["game"]>({
        title: "",
        date_of_event: "",
        settings: {
            time_to_think_sec: 60,
            time_to_answer_sec: 10,
            time_to_dispute_end_min: 10,
            show_leaderboard: false,
            show_questions: false,
            show_answers: false,
            can_appeal: true,
        },
        categories: [],
        teams: [],
        rounds: [],
    });

    // deleted ids копим только в edit-режиме (когда удаляем существующие сущности)
    const [deletedRoundIds, setDeletedRoundIds] = useState<number[]>([]);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);
    const [deletedTeamIds, setDeletedTeamIds] = useState<number[]>([]);
    const [deletedCategoryIds, setDeletedCategoryIds] = useState<number[]>([]);

    async function load() {
        if (isNew || numericGameId == null || Number.isNaN(numericGameId)) return;

        setLoading(true);
        try {
            const res = await hostApi.getGame({ gameId: numericGameId });
            setLoaded(res.game);
            setDraft(toSaveGameDraft(res.game));

            // сбрасываем списки удалений, чтобы не тянуть мусор между играми
            setDeletedRoundIds([]);
            setDeletedQuestionIds([]);
            setDeletedTeamIds([]);
            setDeletedCategoryIds([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]);

    const passcode = loaded?.passcode; // появится только после create (или при edit)

    const rightActionText = isNew ? "Create" : "Save";

    async function onRightAction() {
        if (isNew) {
            // ---- CREATE ----
            // минимальная валидация
            if (!draft.title.trim()) return;
            if (!draft.date_of_event.trim()) return;

            const res = await hostApi.createGame({
                title: draft.title.trim(),
                date_of_event: draft.date_of_event.trim(),
            });

            // После create backend вернёт game с id + passcode + settings дефолтные/или как настроено
            router.replace(`/game/${res.game.id}`);
            return;
        }

        // ---- SAVE ----
        if (!loaded) return;

        const body: SaveGameRequest = {
            game_id: loaded.id,
            version: loaded.version,
            game: draft,
            deleted_round_ids: deletedRoundIds.length ? deletedRoundIds : undefined,
            deleted_question_ids: deletedQuestionIds.length ? deletedQuestionIds : undefined,
            deleted_team_ids: deletedTeamIds.length ? deletedTeamIds : undefined,
            deleted_category_ids: deletedCategoryIds.length ? deletedCategoryIds : undefined,
        };

        const res = await hostApi.saveGame(body);
        setLoaded(res.game);
        setDraft(toSaveGameDraft(res.game));

        // после успешного save обычно чистим deleted списки
        setDeletedRoundIds([]);
        setDeletedQuestionIds([]);
        setDeletedTeamIds([]);
        setDeletedCategoryIds([]);
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <NavBar
                title="Game setup"
                leftIcon={<Icon name="arrow-left" />}
                onLeftPress={() => router.back()}
                rightText={rightActionText}
                onRightPress={onRightAction}
            />

            <View style={{ padding: 24, gap: 16 }}>
                {/* Title + Date */}
                <View style={{ flexDirection: "row", gap: 16 }}>
                    <View style={{ flex: 1 }}>
                        <Text variant="captionM" style={{ color: colors.neutralDark.light, marginBottom: 6 }}>
                            Title
                        </Text>
                        <TextField
                            value={draft.title}
                            placeholder="Placeholder"
                            onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text variant="captionM" style={{ color: colors.neutralDark.light, marginBottom: 6 }}>
                            Date of event
                        </Text>
                        <TextField
                            value={draft.date_of_event}
                            placeholder="eg 23-01-2026"
                            onChangeText={(v) => setDraft((d) => ({ ...d, date_of_event: v }))}
                            helperText="Date should be in format dd-mm-yyyy"
                        />
                    </View>

                    {/* Game code block — только если есть passcode */}
                    {passcode ? (
                        <View style={{ width: 260 }}>
                            <View
                                style={{
                                    backgroundColor: colors.highlight.lightest,
                                    borderRadius: metrics.radius.lg,
                                    padding: 14,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                }}
                            >
                                <View style={{ gap: 4 }}>
                                    <Text variant="bodyL">{passcode}</Text>
                                    <Text variant="captionM" style={{ color: colors.neutralDark.light }}>
                                        Game code to share among teams
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => {
                                        // позже: copy/share (на web можно navigator.clipboard)
                                    }}
                                    hitSlop={10}
                                >
                                    <Icon name="copy" />
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        // чтобы сетка не ломалась можно оставить пустую заглушку
                        <View style={{ width: 260 }} />
                    )}
                </View>

                {/* Дальше сюда добавим Time settings / Other settings / Categories / Teams / Questions */}
                <Card
                    title="Next step"
                    subtitle="We will add Time settings, toggles, categories, teams and questions next."
                    buttonTitle="Back to list"
                    onButtonPress={() => router.replace("/setup")}
                />
            </View>
        </View>
    );
}
