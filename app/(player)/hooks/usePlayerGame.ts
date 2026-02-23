import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/src/api/player';
import {
    GamePhase,
    GameStatuses,
    GameStatus,
    PlayerRequestEvent,
    GameBroadcastEvent,
    PlayerResponseEvent
} from "@/src/dto/common.dto";


export function usePlayerGame(gameId: string, teamId: string, teamName: string) {
    const [status, setStatus] = useState('Подключение...');
    const [gameStarted, setGameStarted] = useState(false);
    const [phase, setPhase] = useState(GamePhase.IDLE);
    const [timer, setTimer] = useState(0);
    const [participantId, setParticipantId] = useState<number | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const url = `${getSocketUrl()}/game`;
        const socket = io(url, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setStatus(`Команда: ${teamName}`);
            socket.emit(PlayerRequestEvent.JoinGame, {
                gameId: Number(gameId),
                teamId: Number(teamId)
            });
        });

        socket.on(GameBroadcastEvent.SyncState, (config: any) => {
            if (config.participantId) setParticipantId(config.participantId);

            setPhase(config.phase);
            setTimer(config.seconds);

            if (config.status === GameStatuses.LIVE || config.phase !== GamePhase.IDLE) {
                setGameStarted(true);
            }
        });

        socket.on(GameBroadcastEvent.TimerUpdate, (data: { seconds: number, phase: GamePhase }) => {
            setTimer(data.seconds);
            setPhase(data.phase);
        });

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            if (data.status === GameStatuses.LIVE) {
                setGameStarted(true);
            }
        });

        socket.on(PlayerResponseEvent.AnswerReceived, () => {
            setStatus('Ответ принят!');
        });

        socket.on('error', (err: { message: string }) => setStatus(`Ошибка: ${err.message}`));
        socket.on('disconnect', () => setStatus('Связь потеряна...'));

        return () => { socket.disconnect(); };
    }, [gameId, teamId, teamName]);

    const submitAnswer = useCallback((answerText: string) => {
        if (socketRef.current && phase !== GamePhase.IDLE) {
            socketRef.current.emit(PlayerRequestEvent.SubmitAnswer, {
                gameId: Number(gameId),
                participantId: participantId,
                answer: answerText
            });
            setStatus('Отправка...');
        }
    }, [gameId, phase, participantId]);

    return { status, gameStarted, phase, timer, submitAnswer };
}