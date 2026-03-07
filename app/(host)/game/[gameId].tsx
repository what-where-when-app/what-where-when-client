import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { NavBar } from "@/src/ui/NavBar";
import { Icon } from "@/src/ui/Icon";
import { Box } from "@/src/ui/Box";
import { Text } from "@/src/ui/Text";
import { colors } from "@/src/theme/colors";

import { useGameEditor } from "@/src/host/game/editor/state";
import { ControlSidebar } from "@/src/host/game/editor/ui/ControlSidebar";
import { EditorContent } from "@/src/host/game/editor/ui/EditorContent";
import { useHostGame } from "@/src/host/game/hooks/useHostGame";
import { AnswersDashboard } from "@/src/host/game/editor/ui/AnswersDashboard";

export default function GameAdminScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const editor = useGameEditor(gameId);

    const {
        gameState,
        answers,
        startGame,
        prepareQuestion,
        startQuestion,
        nextQuestion,
        startTimer,
        stopTimer,
        stopQuestion,
        finishGame,
        judgeAnswer,
        adjustTime
    } = useHostGame(Number(gameId));

    // Стейт для вкладок в главном окне
    const tabs = ['Settings', 'Answers', 'Leaderboard', 'Teams'];
    const [activeTab, setActiveTab] = useState('Answers');

    const handlePrevQuestion = () => {
        if (!gameState.activeQuestionId) return;
        const allQuestions = editor.rounds.flatMap(r => r.questions);
        const currentIndex = allQuestions.findIndex(q => q.id === gameState.activeQuestionId);
        if (currentIndex > 0) {
            const prevId = allQuestions[currentIndex - 1].id;
            if (prevId !== undefined) prepareQuestion(prevId);
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
                        answers={answers}
                        onStartGame={startGame}
                        onPrepareQuestion={prepareQuestion}
                        onStartQuestion={startQuestion}
                        onNextQuestion={nextQuestion}
                        onPrevQuestion={handlePrevQuestion}
                        onStartTimer={startTimer}
                        onStopTimer={stopTimer}
                        onStopQuestion={stopQuestion}
                        onFinishGame={finishGame}
                        onAdjustTime={adjustTime}
                        gameState={gameState}
                        gameName={editor.loaded?.title}
                    />
                )}

                <Box style={styles.mainContent}>
                    {/* ШАПКА РАБОЧЕЙ ЗОНЫ */}
                    <Box row align="center" justify="space-between" style={styles.header}>
                        <Box row align="center" style={{ gap: 12 }}>
                            <Feather name="grid" size={24} color={colors.highlight.darkest} />
                            <Text variant="h2">Game hosting</Text>
                        </Box>
                        <TouchableOpacity onPress={finishGame}>
                            <Text variant="bodyM" style={{ color: colors.highlight.darkest }}>Finish game</Text>
                        </TouchableOpacity>
                    </Box>

                    {/* ВКЛАДКИ */}
                    <Box row justify="flex-start" style={styles.tabsMenu}>
                        {tabs.map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setActiveTab(t)}
                                style={[styles.tabItem, activeTab === t && styles.tabItemActive]}
                            >
                                <Text variant="bodyM" style={{
                                    fontWeight: activeTab === t ? 'bold' : 'normal',
                                    color: activeTab === t ? colors.neutralDark.darkest : colors.neutralDark.light
                                }}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </Box>

                    {/* КОНТЕНТ ВКЛАДОК */}
                    <Box flex={1}>
                        {activeTab === 'Settings' && <EditorContent editor={editor} />}
                        {activeTab === 'Answers' && (
                            <AnswersDashboard rounds={editor.rounds} answers={answers} onJudge={judgeAnswer} />
                        )}
                        {activeTab === 'Leaderboard' && (
                            <Box flex={1} justify="center" align="center"><Text>Leaderboard (coming soon)</Text></Box>
                        )}
                        {activeTab === 'Teams' && (
                            <Box flex={1} justify="center" align="center"><Text>Teams management (coming soon)</Text></Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.neutralLight.lightest },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    layout: { flex: 1, flexDirection: 'row' },
    mainContent: { flex: 1, backgroundColor: colors.neutralLight.lightest },
    header: { paddingHorizontal: 32, paddingTop: 24, paddingBottom: 16 },
    tabsMenu: { borderBottomWidth: 1, borderColor: colors.neutralLight.medium, paddingHorizontal: 16 },
    tabItem: { paddingVertical: 12, paddingHorizontal: 24 },
    tabItemActive: { borderBottomWidth: 3, borderColor: colors.highlight.darkest },
});