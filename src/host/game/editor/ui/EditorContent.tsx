import React from 'react';
import { ScrollView } from 'react-native';
import {GameMetaRow} from "@/src/host/game/editor/ui/GameMetaRow";
import {SettingsSections} from "@/src/host/game/editor/ui/Settings";
import {CategoriesSection} from "@/src/host/game/editor/ui/Categories";
import {TeamsSection} from "@/src/host/game/editor/ui/Teams";
import {QuestionsSection} from "@/src/host/game/editor/ui/Questions";

interface EditorContentProps {
    editor: any;
}

export const EditorContent = ({ editor }: EditorContentProps) => {
    return (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
            <GameMetaRow
                title={editor.draft.title}
                date_of_event={editor.draft.date_of_event}
                passcode={editor.loaded?.passcode}
                onChangeTitle={editor.setTitle}
                onChangeDate={editor.setDate}
            />

            <SettingsSections
                settings={editor.draft.settings}
                onChange={(next) => editor.setDraft((d: any) => ({ ...d, settings: next }))}
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
    );
};