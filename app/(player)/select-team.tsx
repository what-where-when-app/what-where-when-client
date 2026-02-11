import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Tag } from '@/src/ui/Tag';
import {colors} from "@/src/theme/colors";
import {metrics} from "@/src/theme/metrics";

export default function SelectTeamScreen() {
    const { gameData } = useLocalSearchParams();
    const router = useRouter();

    const game = gameData ? JSON.parse(gameData as string) : null;
    const allTeams = game?.teams || [];
    const availableTeams = allTeams.filter((t: any) => !t.isTaken);

    const handleSelect = (team: any) => {
        router.replace({
            pathname: './game',
            params: {
                gameId: game.gameId,
                teamId: team.teamId,
                teamName: team.name
            }
        });
    };

    return (
        <Box style={styles.container}>
            <Box style={styles.header}>
                <Text variant="h4" style={{ marginBottom: 4 }}>
                    Игра: {game?.gameName}
                </Text>
                <Text variant="bodyM" style={{ color: '#666' }}>
                    Выберите команду:
                </Text>
            </Box>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {availableTeams.map((team: any) => (
                    <TouchableOpacity
                        key={team.teamId}
                        onPress={() => handleSelect(team)}
                        activeOpacity={0.7}
                    >
                        <Box style={styles.card}>
                            <Text variant="bodyL" style={styles.teamName}>
                                {team.name}
                            </Text>
                            <Tag text="Свободно" />
                        </Box>
                    </TouchableOpacity>
                ))}

                {availableTeams.length === 0 && (
                    <Text variant="bodyM" style={styles.emptyText}>
                        Нет свободных команд
                    </Text>
                )}
            </ScrollView>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        marginTop: 16,
        marginBottom: 24,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: metrics.radius.md,
    },
    teamName: {
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#888',
    }
});