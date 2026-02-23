import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/src/hooks/useSocket';
import {
    AdminRequestEvent,
    AdminResponseEvent,
    GameBroadcastEvent,
    GamePhase,
    GameStatus,
    GameStatuses
} from "@/src/dto/common.dto";
import {AnswerDomain} from "@/src/dto/game.dto";

export function useHostGame(gameId: number) {
    const socket = useSocket('game');

    const [gameState, setGameState] = useState({
        phase: GamePhase.IDLE,
        seconds: 0,
        activeQuestionId: null as number | null,
        status: GameStatuses.DRAFT
    });
    const [answers, setAnswers] = useState<AnswerDomain[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.emit(AdminRequestEvent.Sync, { gameId });

        socket.on(GameBroadcastEvent.SyncState, (data: { state: any, answers: AnswerDomain[] }) => {
            setGameState({
                phase: data.state.phase,
                seconds: data.state.seconds,
                activeQuestionId: data.state.activeQuestionId || null,
                status: data.state.status || GameStatuses.DRAFT,
            });
            setAnswers(data.answers);
        });

        socket.on(AdminResponseEvent.AnswerUpdate, (updatedAnswer: AnswerDomain) => {
            setAnswers(prev => {
                const index = prev.findIndex(a => a.id === updatedAnswer.id);
                if (index !== -1) {
                    const newAnswers = [...prev];
                    newAnswers[index] = updatedAnswer;
                    return newAnswers;
                }
                return [...prev, updatedAnswer];
            });
        });

        socket.on(GameBroadcastEvent.TimerUpdate, (data: { seconds: number, phase: GamePhase, activeQuestionId: number }) => {
            setGameState(prev => ({ ...prev, seconds: data.seconds, phase: data.phase, activeQuestionId: data.activeQuestionId || prev.activeQuestionId}));
        });

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            setGameState(prev => ({ ...prev, status: data.status }));
        });

        return () => {
            socket.off(GameBroadcastEvent.SyncState);
            socket.off(AdminResponseEvent.AnswerUpdate);
            socket.off(GameBroadcastEvent.TimerUpdate);
            socket.off(GameBroadcastEvent.StatusChanged);
        };
    }, [socket, gameId]);

    const startGame = useCallback(() => {
        socket?.emit(AdminRequestEvent.StartGame, { gameId });
    }, [socket, gameId]);

    const startQuestion = useCallback((questionId: number) => {
        socket?.emit(AdminRequestEvent.StartQuestion, { gameId, questionId });
    }, [socket, gameId]);

    const judgeAnswer = useCallback((answerId: number, verdict: string) => {
        socket?.emit(AdminRequestEvent.JudgeAnswer, { gameId, answerId, verdict });
    }, [socket, gameId]);

    const nextQuestion = useCallback(() => {
        socket?.emit(AdminRequestEvent.NextQuestion, { gameId });
    }, [socket, gameId]);

    return { gameState, answers, startGame, startQuestion, nextQuestion, judgeAnswer };
}