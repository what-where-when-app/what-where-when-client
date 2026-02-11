import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { getSocketUrl } from '@/src/api/player';
import {colors} from "@/src/theme/colors";

export default function GameScreen() {
    const params = useLocalSearchParams();
    const { gameId, teamId, teamName } = params;

    const [status, setStatus] = useState('Подключение...');
    const [phase, setPhase] = useState('IDLE');
    const [timer, setTimer] = useState(0);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Убедись, что getSocketUrl возвращает корректный базовый URL
        const url = `${getSocketUrl()}/game`;
        socketRef.current = io(url, {
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to WS');
            setStatus('Вход в игру...');
            socket.emit('join_game', {
                gameId: Number(gameId),
                teamId: Number(teamId)
            });
        });

        socket.on('sync_state', (state: any) => {
            setPhase(state.phase);
            setTimer(state.seconds);
            setStatus(`Вы играете за: ${teamName}`);
        });

        socket.on('timer_update', (data: any) => {
            setTimer(data.seconds);
            setPhase(data.phase);
        });

        socket.on('disconnect', () => {
            setStatus('Связь потеряна. Переподключение...');
        });

        socket.on('error', (err: any) => {
            setStatus(`Ошибка: ${err.message || 'Неизвестная ошибка'}`);
        });

        return () => {
            socket.disconnect();
        };
    }, [gameId, teamId]);

    return (
        <Box style={styles.container}>
            {/* Верхняя часть: Инфо */}
            <Box style={styles.headerContainer}>
                <Text variant="h4" style={{ textAlign: 'center' }}>
                    {teamName}
                </Text>
                <Text variant="captionM" style={{ color: '#888', marginTop: 4 }}>
                    ID игры: {gameId}
                </Text>
            </Box>

            {/* Центр: Игровой процесс */}
            <Box style={styles.centerContainer}>
                {phase === 'IDLE' && (
                    <Text variant="bodyL" style={{ textAlign: 'center' }}>
                        Ожидание ведущего...
                    </Text>
                )}

                {phase === 'THINKING' && (
                    <Box style={{ alignItems: 'center' }}>
                        {/* Используем h1 для таймера, можно увеличить через style если нужно больше */}
                        <Text variant="h1" style={{ fontSize: 80, lineHeight: 88 }}>
                            {timer}
                        </Text>
                        <Text variant="bodyM" style={{ marginTop: 8 }}>
                            Время на обсуждение
                        </Text>
                    </Box>
                )}

                {phase === 'ANSWERING' && (
                    <Box style={{ width: '100%', paddingHorizontal: 20 }}>
                        <Text variant="h5" style={{ textAlign: 'center', marginBottom: 24 }}>
                            Время отвечать!
                        </Text>
                        <Button
                            title="Отправить ответ"
                            onPress={() => console.log('Ответ')}
                            variant="primary"
                            size="md"
                        />
                    </Box>
                )}
            </Box>

            {/* Низ: Статус бар */}
            <Box style={styles.footerContainer}>
                <Text variant="captionM" style={{ textAlign: 'center', color: '#555' }}>
                    Статус: {status}
                </Text>
            </Box>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        justifyContent: 'space-between',
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerContainer: {
        padding: 12,
        backgroundColor: colors.neutralLight.light,
        borderRadius: 8,
    },
});