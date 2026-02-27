import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { NavBar } from "@/src/ui/NavBar";
import { Icon } from "@/src/ui/Icon";
import { Box } from "@/src/ui/Box";
import { colors } from "@/src/theme/colors";

import { useGameEditor } from "@/app/(host)/game/editor/state";
import { ControlSidebar } from "@/app/(host)/game/editor/ui/ControlSidebar";
import { EditorContent } from "@/app/(host)/game/editor/ui/EditorContent";
import { useHostGame } from "@/app/(host)/game/hooks/useHostGame";
import { AnswersDashboard } from "@/app/(host)/game/editor/ui/AnswersDashboard";
import { GameStatuses } from "@/src/dto/common.dto";


export default function GameAdminScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const editor = useGameEditor(gameId);

    const {
        gameState,
        answers,
        startGame,
        startQuestion,
        nextQuestion,
        startTimer,
        stopTimer,
        judgeAnswer
    } = useHostGame(Number(gameId));

    const handlePrevQuestion = () => {
        if (!gameState.activeQuestionId) return;

        const allQuestions = editor.rounds.flatMap(r => r.questions);

        const currentIndex = allQuestions.findIndex(q => q.id === gameState.activeQuestionId);

        if (currentIndex > 0) {
            const prevId = allQuestions[currentIndex - 1].id;
            if (prevId !== undefined) {
                startQuestion(prevId);
            }
        }
    };

    if (editor.loading) {
        return (
            <Box style={styles.centered}>
                <ActivityIndicator color={colors.neutralDark.dark} />
            </Box>
        );
    }

    return (
        <Box style={styles.screen}>
            <NavBar
                title="Conducting a Game"
                leftIcon={<Icon name="arrow-left" />}
                onLeftPress={() => router.back()}
                rightText={editor.isNew ? "Create" : "Save"}
                onRightPress={editor.primaryAction}
            />

            <Box style={styles.layout}>
                {editor.isNew ? (
                    <></>
                ) : (
                    <ControlSidebar
                        isNew={editor.isNew}
                        rounds={editor.rounds}
                        onStartGame={startGame}
                        onStartQuestion={startQuestion}
                        onNextQuestion={nextQuestion}
                        onPrevQuestion={handlePrevQuestion}
                        onStartTimer={startTimer}
                        onStopTimer={stopTimer}
                        gameState={gameState}
                        gameName={editor.loaded?.title}
                    />
                )}
                <Box style={styles.mainContent}>
                    {gameState.status === GameStatuses.LIVE && (
                        <AnswersDashboard
                            rounds={editor.rounds}
                            answers={answers}
                            onJudge={judgeAnswer}
                        />
                    )}
                    <EditorContent editor={editor} />
                </Box>
            </Box>
        </Box>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.neutralLight.lightest },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    layout: { flex: 1, flexDirection: 'row' },
    mainContent: { flex: 1 },
});