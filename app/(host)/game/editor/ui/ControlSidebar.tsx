import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { UIRound } from '@/app/(host)/game/editor/types';
import { GamePhase, GameStatus, GameStatuses } from "@/src/dto/common.dto";
import { ListItem } from "@/src/ui/ListItem";

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
    onPrevQuestion: () => void;
    onStartTimer: () => void;
    onStopTimer: () => void;
}

export const ControlSidebar = ({
                                   isNew,
                                   rounds,
                                   gameName,
                                   gameState,
                                   onStartGame,
                                   onStartQuestion,
                                   onNextQuestion,
                                   onPrevQuestion,
                                   onStartTimer,
                                   onStopTimer
                               }: ControlSidebarProps) => {

    const currentQuestionNumber = rounds
        .flatMap(r => r.questions)
        .find(q => q.id === gameState.activeQuestionId)?.question_number;

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
            <Box style={styles.section}>
                <Box style={styles.statusSection}>
                    <Text variant="h1">{gameName}</Text>
                    <ListItem
                        title={statusTag.label}
                        style={{ backgroundColor: statusTag.color }}
                    />
                </Box>

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
                        {currentQuestionNumber && (
                            <Text variant="captionM" style={styles.phaseText}>
                                Вопрос {currentQuestionNumber}
                            </Text>
                        )}
                    </Box>

                    {isLive && (
                        <Box row gap={8}>
                            <Box flex={1}>
                                <Button title="Старт" onPress={onStartTimer} variant="primary" />
                            </Box>
                            <Box flex={1}>
                                <Button title="Стоп" onPress={onStopTimer} variant="secondary" />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {isLive && (
                <ScrollView style={styles.roundsContainer} showsVerticalScrollIndicator={false}>
                    {rounds.map(round => (
                        <Box key={round.id} style={styles.roundWrapper}>
                            <Text variant="bodyS" style={styles.roundTitle}>{round.name}</Text>
                            {round.questions.map(q => {
                                if (q.id === undefined) return null;

                                const isActive = gameState.activeQuestionId === q.id;
                                return (
                                    <Box key={q.id} style={styles.questionBtn}>
                                        <Button
                                            title={`Вопрос ${q.question_number}`}
                                            onPress={() => onStartQuestion(q.id as number)}
                                            variant={isActive ? 'primary' : 'tertiary'}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                </ScrollView>
            )}

            <Box style={styles.section}>
                {!isLive && !isNew && (
                    <Button title="Start game" onPress={onStartGame} variant="primary" />
                )}

                {isLive && (
                    <Box row gap={8}>
                        <Box flex={1}>
                            <Button
                                title="< Пред"
                                onPress={onPrevQuestion}
                                variant="secondary"
                                disabled={!gameState.activeQuestionId}
                            />
                        </Box>
                        <Box flex={1}>
                            <Button
                                title="След >"
                                onPress={onNextQuestion}
                                variant="primary"
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 300,
        borderRightWidth: 1,
        borderRightColor: colors.neutralLight.light,
        backgroundColor: colors.neutralLight.lightest,
        padding: 16,
        justifyContent: 'space-between',
    },
    statusSection: { gap: 10, marginBottom: 16 },
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

    roundsContainer: {
        flex: 1,
        marginTop: 16,
        marginBottom: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight.medium,
        paddingVertical: 8,
    },
    roundWrapper: { marginBottom: 16 },
    roundTitle: { fontWeight: '700', marginBottom: 6, color: colors.neutralDark.light },
    questionBtn: { marginBottom: 6 },
});