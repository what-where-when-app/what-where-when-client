// app/(player)/game.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { usePlayerGame } from './hooks/usePlayerGame';
import {AnsweringPhase, GameLobby, ThinkingPhase} from "@/app/(player)/components/GamePhases";
import {GamePhase} from "@/src/dto/common.dto";

export default function GameScreen() {
    const { gameId, teamId, teamName } = useLocalSearchParams<{ gameId: string, teamId: string, teamName: string }>();

    const { status, gameStarted, phase, timer, submitAnswer } = usePlayerGame(gameId, teamId, teamName);

    return (
        <Box style={styles.container}>
            <Header teamName={teamName} gameId={gameId} />

            <Box style={styles.centerContainer}>
                {gameStarted ? (
                    <>
                        {phase === GamePhase.IDLE && <Text variant="h5">Приготовьтесь...</Text>}
                        {phase !== GamePhase.IDLE && <ThinkingPhase timer={timer}/>}
                        {phase !== GamePhase.IDLE && <AnsweringPhase
                            onSubmit={submitAnswer}
                        />}
                    </>
                ) : (
                    <GameLobby/>
                )}
            </Box>

            <Footer status={status} />
        </Box>
    );
}

// Вспомогательные мини-компоненты для чистоты
const Header = ({ teamName, gameId }: any) => (
    <Box style={styles.headerContainer}>
        <Text variant="h4">{teamName}</Text>
        <Text variant="captionM" style={{ color: '#888' }}>ID игры: {gameId}</Text>
    </Box>
);

const Footer = ({ status }: any) => (
    <Box style={styles.footerContainer}>
        <Text variant="captionM" style={{ textAlign: 'center' }}>Статус: {status}</Text>
    </Box>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'space-between' },
    headerContainer: { alignItems: 'center', marginTop: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footerContainer: { padding: 12, backgroundColor: colors.neutralLight.light, borderRadius: 8 },
});