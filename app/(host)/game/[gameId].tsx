import React from "react";
import {ActivityIndicator, ScrollView, View} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { NavBar } from "@/src/ui/NavBar";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import {useGameEditor} from "@/app/(host)/game/editor/state";
import {GameMetaRow} from "@/app/(host)/game/editor/ui/GameMetaRow";
import {SettingsSections} from "@/app/(host)/game/editor/ui/Settings";
import {CategoriesSection} from "@/app/(host)/game/editor/ui/Categories";
import {TeamsSection} from "@/app/(host)/game/editor/ui/Teams";
import {QuestionsSection} from "@/app/(host)/game/editor/ui/Questions";


export default function GameSetupScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const editor = useGameEditor(gameId);

    if (editor.loading) {
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
                rightText={editor.isNew ? "Create" : "Save"}
                onRightPress={editor.primaryAction}
            />

            <ScrollView style={{ padding: 24 }}>
                <GameMetaRow
                    title={editor.draft.title}
                    date_of_event={editor.draft.date_of_event}
                    passcode={editor.loaded?.passcode}
                    onChangeTitle={editor.setTitle}
                    onChangeDate={editor.setDate}
                />

                <SettingsSections
                    settings={editor.draft.settings}
                    onChange={(next) => editor.setDraft((d) => ({ ...d, settings: next }))}
                />

                <CategoriesSection
                    categories={editor.draft.categories}
                    onAdd={editor.addCategory}
                    onRemove={editor.removeCategory}
                />

                <TeamsSection
                    teams={editor.draft.teams}
                    onAdd={editor.addTeam}
                    onRemove={editor.removeTeam}
                />

                <QuestionsSection
                    rounds={editor.rounds}
                    selectedRound={editor.selectedRound}
                    selectedQuestion={editor.selectedQuestion}
                    selectedRoundKey={editor.selectedRoundKey}
                    selectedQuestionKey={editor.selectedQuestionKey}
                    onAddRound={editor.addRound}
                    onRemoveRound={editor.removeRound}
                    onSelectRound={editor.selectRound}
                    onAddQuestion={editor.addQuestion}
                    onRemoveQuestion={editor.removeQuestion}
                    onSelectQuestion={editor.selectQuestion}
                    onUpdateSelectedQuestion={editor.updateSelectedQuestion}
                    onUpdateRoundName={editor.updateSelectedRoundName}
                />
            </ScrollView>
        </View>
    );
}
