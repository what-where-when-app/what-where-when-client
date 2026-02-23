import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { UIRound } from '@/app/(host)/game/editor/types';
import {GamePhase, GameStatus, GameStatuses} from "@/src/dto/common.dto";
import {ListItem} from "@/src/ui/ListItem";

interface ControlSidebarProps {
    isNew: boolean;
    rounds: UIRound[];
    gameName?: string;
    gameState: {
        phase: GamePhase;
        seconds: number;
        activeQuestionId: number | null;
        status: GameStatus;
    };
    onStartGame: () => void;
    onStartQuestion: (id: number) => void;
    onNextQuestion: () => void;
}

export const ControlSidebar = ({ isNew, rounds, gameName, gameState, onStartGame, onStartQuestion, onNextQuestion }: ControlSidebarProps) => {
    const currentQuestionNumber = rounds.flatMap(r => r.questions).find(q => q.id === gameState.activeQuestionId)?.question_number;
    const getStatusTagProps = () => {
        switch (gameState.status) {
            case GameStatuses.LIVE:
                return { label: 'Game ongoing', color: colors.success.light };
            case GameStatuses.FINISHED:
                return { label: 'FINISHED', color: colors.error.light };
            default:
                return { label: 'Game not started', color: colors.neutralLight.dark };
        }
    };

    const statusTag = getStatusTagProps();
    const isRunning = gameState.phase !== GamePhase.IDLE;
    const isLive = gameState.status === GameStatuses.LIVE;

    return (
        <Box style={styles.sidebar}>
            <Box style={styles.statusSection}>
                <Text variant="h1">{gameName}</Text>
                <ListItem
                    title={statusTag.label}
                    style={{
                        backgroundColor: statusTag.color,
                    }}
                />
            </Box>
            <Box style={styles.section}>
                {/* Таймер */}
                <Box style={styles.section}>
                    <Text variant="captionM" style={styles.label}>Таймер</Text>
                    <Box style={[styles.statusCard, isRunning && styles.statusCardActive]}>
                        <Text
                            variant="h2"
                            style={[
                                styles.timer,
                                (isRunning && gameState.seconds <= 10) && { color: colors.error.light }
                            ]}
                        >
                            {isRunning ? gameState.seconds : '--'}
                        </Text>
                        <Text variant="captionM" style={styles.phaseText}>
                            {isRunning ? gameState.phase.toUpperCase() : 'ГОТОВ'}
                        </Text>
                        <Text variant="captionM" style={styles.phaseText}>
                            {currentQuestionNumber}
                        </Text>
                    </Box>
                </Box>
                {/* Кнопка старта игры (если еще не LIVE) */}
                {!isLive && !isNew && (
                    <Button
                        title="Start game"
                        onPress={onStartGame}
                        variant="primary"
                    />
                )}

                {/* Кнопка Next Question (появляется, когда игра LIVE) */}
                {isLive && (
                    <Button
                        title={gameState.activeQuestionId ? "Next question" : "Start first question"}
                        onPress={onNextQuestion}
                        variant="primary"
                    />
                )}

                {/* Если вопросы закончились */}
                {isLive && !isRunning && (
                    <Text variant="bodyS" style={{ textAlign: 'center', color: colors.neutralDark.light }}>
                        Все вопросы отыграны
                    </Text>
                )}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    statusSection: {
        gap: 10
    },
    sidebar: {
        width: 260,
        borderRightWidth: 1,
        borderRightColor: colors.neutralLight.light,
        backgroundColor: colors.neutralLight.lightest,
        padding: 16,
        justifyContent: 'space-between',
    },
    section: { gap: 12 },
    label: {
        color: colors.neutralDark.light,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    statusCard: {
        backgroundColor: colors.neutralLight.light,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statusCardActive: {
        backgroundColor: colors.neutralLight.lightest,
        borderWidth: 1,
        borderColor: colors.error.dark,
    },
    timer: { fontSize: 48, fontWeight: '700' },
    phaseText: { marginTop: 4, color: colors.neutralDark.dark },
    roundWrapper: { marginBottom: 16 },
    roundTitle: { fontWeight: '700', marginBottom: 6, color: colors.neutralDark.light },
    questionBtn: { marginTop: 6, justifyContent: 'flex-start' },
});