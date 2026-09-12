import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '@/src/hooks/useSocket';
import {
    AdminRequestEvent,
    AdminResponseEvent,
    GameBroadcastEvent,
    GamePhase,
    GameStatus,
    GameStatuses
} from "@/src/dto/common.dto";
import { AnswerDomain, GameState, LeaderboardEntry, ParticipantDomain } from "@/src/dto/game.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

export interface HostNotification {
    id: string;
    type: 'error' | 'info';
    message: string;
}

const NOTIFICATION_TTL_MS = 6000;

export function useHostGame(gameId: number) {
    const { t } = useTranslation();
    const socket = useSocket('game');

    const [notifications, setNotifications] = useState<HostNotification[]>([]);
    const notificationIdRef = useRef(0);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const pushNotification = useCallback((type: HostNotification['type'], message: string) => {
        const id = `${Date.now()}-${notificationIdRef.current++}`;
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => dismissNotification(id), NOTIFICATION_TTL_MS);
    }, [dismissNotification]);

    const [gameState, setGameState] = useState<GameState>({
        phase: GamePhase.IDLE,
        seconds: 0,
        isPaused: false,
        status: GameStatuses.DRAFT
    });

    const [answers, setAnswers] = useState<AnswerDomain[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [participants, setParticipants] = useState<ParticipantDomain[]>([]);

    const gameStateRef = useRef<GameState>(gameState);
    const prevStatusRef = useRef<GameStatus | null>(null);
    const prevPhaseRef = useRef<GamePhase | null>(null);
    const prevActiveQuestionIdRef = useRef<number | null>(null);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const trackStateTransitions = useCallback((state: GameState) => {
        const prevStatus = prevStatusRef.current;
        const prevPhase = prevPhaseRef.current;
        const prevQ = prevActiveQuestionIdRef.current;

        if (prevStatus && state.status && prevStatus !== state.status) {
            void mixpanel.track("Game Status Changed", {
                game_id: gameId,
                from: String(prevStatus),
                to: String(state.status),
            });
        }
        if (prevPhase && state.phase && prevPhase !== state.phase) {
            void mixpanel.track("Game Phase Changed", {
                game_id: gameId,
                from: String(prevPhase),
                to: String(state.phase),
                active_question_id: state.activeQuestionId ?? null,
                active_question_number: (state as any).activeQuestionNumber ?? null,
            });
        }
        if (prevQ && state.activeQuestionId && prevQ !== state.activeQuestionId) {
            void mixpanel.track("Host Active Question Changed", {
                game_id: gameId,
                from_question_id: prevQ,
                to_question_id: state.activeQuestionId,
                to_question_number: (state as any).activeQuestionNumber ?? null,
            });
        }

        prevStatusRef.current = state.status ?? null;
        prevPhaseRef.current = state.phase ?? null;
        prevActiveQuestionIdRef.current = state.activeQuestionId ?? null;
    }, [gameId]);

    useEffect(() => {
        if (!socket || !gameId || isNaN(gameId)) return;

        // Re-sync on every connect, not just the first one: socket.io-client
        // keeps the same Socket instance across automatic reconnects (network
        // blips, app backgrounded/foregrounded), but the server treats each
        // reconnect as a brand-new connection and forgets prior room
        // membership. Without re-emitting Sync here, the host would stop
        // receiving TimerUpdate/StatusChanged/AnswerUpdate/LeaderboardUpdate
        // silently after any reconnect.
        const syncAdmin = () => {
            socket.emit(AdminRequestEvent.Sync, { gameId });
            void mixpanel.track("Host Admin Sync Emitted", { game_id: gameId });
        };

        socket.on('connect', syncAdmin);
        if (socket.connected) syncAdmin();

        socket.on(GameBroadcastEvent.SyncState, (data: {
            state: GameState,
            answers: AnswerDomain[],
            leaderboard?: LeaderboardEntry[]
            participants?: ParticipantDomain[]
        }) => {
            if (data.state) {
                setGameState(prev => ({ ...prev, ...data.state }));
                trackStateTransitions(data.state);
            }
            if (data.answers) {
                setAnswers(data.answers);
            }
            if (data.leaderboard) {
                setLeaderboard(data.leaderboard);
            }
            if (data.participants) {
                setParticipants(data.participants);
            }
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

        socket.on(GameBroadcastEvent.TimerUpdate, (state: GameState) => {
            setGameState(prev => {
                const isNeutralPhase = state.phase === GamePhase.IDLE || state.phase === GamePhase.PREPARATION;

                return {
                    ...prev,
                    ...state,
                    isPaused: isNeutralPhase ? false : (state.isPaused ?? prev.isPaused)
                };
            });
            trackStateTransitions(state);
        });

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            setGameState(prev => ({ ...prev, status: data.status, isPaused: false }));
            // status transition tracked in trackStateTransitions via TimerUpdate/SyncState,
            // but StatusChanged can arrive alone; track it explicitly too.
            void mixpanel.track("Game Status Changed", {
                game_id: gameId,
                to: String(data.status),
            });
        });

        socket.on(GameBroadcastEvent.TimerPaused, () => {
            setGameState(prev => ({ ...prev, isPaused: true }));
            const s = gameStateRef.current;
            void mixpanel.track("Timer Paused Broadcast", {
                game_id: gameId,
                phase: String(s.phase),
                time_left_s: s.seconds,
                active_question_id: s.activeQuestionId ?? null,
            });
        });

        socket.on(GameBroadcastEvent.TimerResumed, () => {
            setGameState(prev => ({ ...prev, isPaused: false }));
            const s = gameStateRef.current;
            void mixpanel.track("Timer Resumed Broadcast", {
                game_id: gameId,
                phase: String(s.phase),
                time_left_s: s.seconds,
                active_question_id: s.activeQuestionId ?? null,
            });
        });

        socket.on(GameBroadcastEvent.LeaderboardUpdate, (data: LeaderboardEntry[]) => {
            setLeaderboard(data);
        });

        // WsExceptionsFilter is the server's only channel for surfacing
        // failed admin actions (forbidden, judging too early, unexpected
        // errors) — without this listener they fail completely silently.
        socket.on('error', (err: { message?: string }) => {
            pushNotification('error', err?.message || t('hostNotifications.genericError'));
        });

        socket.on(AdminResponseEvent.NoMoreQuestions, () => {
            pushNotification('info', t('hostNotifications.noMoreQuestions'));
        });

        return () => {
            socket.off('connect', syncAdmin);
            socket.off(GameBroadcastEvent.SyncState);
            socket.off(AdminResponseEvent.AnswerUpdate);
            socket.off(GameBroadcastEvent.TimerUpdate);
            socket.off(GameBroadcastEvent.StatusChanged);
            socket.off(GameBroadcastEvent.TimerPaused);
            socket.off(GameBroadcastEvent.TimerResumed);
            socket.off(GameBroadcastEvent.LeaderboardUpdate);
            socket.off('error');
            socket.off(AdminResponseEvent.NoMoreQuestions);
        };
    }, [socket, gameId, trackStateTransitions, pushNotification, t]);

    const startGame = useCallback(() => {
        void mixpanel.track("Host Game Start Clicked", { game_id: gameId });
        socket?.emit(AdminRequestEvent.StartGame, { gameId });
    }, [socket, gameId]);

    const prepareQuestion = useCallback((questionId: number) => {
        void mixpanel.track("Host Question Prepared", { game_id: gameId, question_id: questionId });
        socket?.emit(AdminRequestEvent.PrepareQuestion, { gameId, questionId });
    }, [socket, gameId]);

    const startQuestion = useCallback((questionId: number) => {
        void mixpanel.track("Host Question Started", { game_id: gameId, question_id: questionId });
        socket?.emit(AdminRequestEvent.StartQuestion, { gameId, questionId });
    }, [socket, gameId]);

    const nextQuestion = useCallback(() => {
        void mixpanel.track("Host Next Question", { game_id: gameId });
        socket?.emit(AdminRequestEvent.NextQuestion, { gameId });
    }, [socket, gameId]);

    const startTimer = useCallback(() => {
        void mixpanel.track("Host Timer Resumed", { game_id: gameId });
        socket?.emit(AdminRequestEvent.ResumeTimer, { gameId });
    }, [socket, gameId]);

    const stopTimer = useCallback(() => {
        void mixpanel.track("Host Timer Paused", { game_id: gameId });
        socket?.emit(AdminRequestEvent.PauseTimer, { gameId });
    }, [socket, gameId]);

    const judgeAnswer = useCallback((answerId: number, verdict: string) => {
        void mixpanel.track("Host Answer Judged", { game_id: gameId, answer_id: answerId, verdict });
        socket?.emit(AdminRequestEvent.JudgeAnswer, { gameId, answerId, verdict });
    }, [socket, gameId]);

    const addManualAnswer = useCallback((questionId: number, participantId: number) => {
        void mixpanel.track("Host Manual Answer Added", { game_id: gameId, question_id: questionId, participant_id: participantId });
        socket?.emit(AdminRequestEvent.AddManualAnswer, { gameId, participantId, questionId });
    }, [socket, gameId]);

    const stopQuestion = useCallback(() => {
        void mixpanel.track("Host Question Stopped", { game_id: gameId });
        socket?.emit(AdminRequestEvent.StopQuestion, { gameId });
    }, [socket, gameId]);

    const finishGame = useCallback(() => {
        void mixpanel.track("Host Game Finished", { game_id: gameId });
        socket?.emit(AdminRequestEvent.FinishGame, { gameId });
    }, [socket, gameId]);

    const adjustTime = useCallback((delta: number) => {
        void mixpanel.track("Host Time Adjusted", { game_id: gameId, delta_s: delta });
        socket?.emit(AdminRequestEvent.AdjustTime, { gameId, delta });
    }, [socket, gameId]);

    return {
        gameState,
        answers,
        leaderboard,
        participants,
        startGame,
        prepareQuestion,
        startQuestion,
        nextQuestion,
        stopQuestion,
        finishGame,
        startTimer,
        stopTimer,
        judgeAnswer,
        addManualAnswer,
        adjustTime,
        notifications,
        dismissNotification
    };
}