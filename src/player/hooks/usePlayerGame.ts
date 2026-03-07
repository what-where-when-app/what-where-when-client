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
import {GameState} from "@/src/dto/game.dto";

export function usePlayerGame(gameId: string, teamId: string, teamName: string) {
    const [status, setStatus] = useState('Подключение...');
    const [gameStarted, setGameStarted] = useState(false);
    const [phase, setPhase] = useState<GamePhase>(GamePhase.IDLE);
    const [timer, setTimer] = useState(0);
    const [participantId, setParticipantId] = useState<number | null>(null);

    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
    const [activeQuestionNumber, setActiveQuestionNumber] = useState<number | null>(null);
    const [lastAnswerStatus, setLastAnswerStatus] = useState<'success' | 'error' | null>(null);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (phase === GamePhase.IDLE || phase === GamePhase.PREPARATION) {
            setLastAnswerStatus(null);
        }
    }, [phase, activeQuestionId]);

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

        socket.on(GameBroadcastEvent.SyncState, (data: { state: GameState, participantId: number }) => {
            if (data.participantId) setParticipantId(data.participantId);

            const state = data.state;
            if (state) {
                setPhase(state.phase);
                setTimer(state.seconds);

                if (state.activeQuestionId !== undefined) setActiveQuestionId(state.activeQuestionId);
                if (state.activeQuestionNumber !== undefined) setActiveQuestionNumber(state.activeQuestionNumber);

                if (state.status === GameStatuses.LIVE || state.phase !== GamePhase.IDLE) {
                    setGameStarted(true);
                }
            }
        });

        socket.on(GameBroadcastEvent.TimerUpdate, (state: GameState) => {
            setTimer(state.seconds);
            setPhase(state.phase);

            if (state.activeQuestionId !== undefined) setActiveQuestionId(state.activeQuestionId);
            if (state.activeQuestionNumber !== undefined) setActiveQuestionNumber(state.activeQuestionNumber);
        });

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            if (data.status === GameStatuses.LIVE) {
                setGameStarted(true);
            }
        });

        socket.on(PlayerResponseEvent.AnswerReceived, () => {
            setLastAnswerStatus('success');
            setStatus(`Команда: ${teamName}`);
        });

        socket.on('error', (err: { message: string }) => {
            setStatus(`Ошибка: ${err.message}`);
            setLastAnswerStatus('error');
        });

        socket.on('disconnect', () => setStatus('Связь потеряна...'));

        return () => { socket.disconnect(); };
    }, [gameId, teamId, teamName]);

    const submitAnswer = useCallback((answerText: string) => {
        if (socketRef.current && phase !== GamePhase.IDLE && phase !== GamePhase.PREPARATION && participantId && activeQuestionId) {

            socketRef.current.emit(PlayerRequestEvent.SubmitAnswer, {
                gameId: Number(gameId),
                participantId: participantId,
                questionId: activeQuestionId,
                answer: answerText,
                submittedAt: new Date().toISOString()
            });
            setStatus('Отправка...');
        }
    }, [gameId, phase, participantId, activeQuestionId]);

    return {
        status,
        gameStarted,
        phase,
        timer,
        activeQuestionNumber,
        lastAnswerStatus,
        submitAnswer
    };
}