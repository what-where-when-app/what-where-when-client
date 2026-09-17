import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/src/api/player';
import { getAccessToken } from '@/src/auth/session';

const PARTICIPANT_SESSION_KEY = (gameId: string, teamId: string) =>
    `www-player-participant:${gameId}:${teamId}`;

export function readStoredParticipantId(gameId: string, teamId: string): number | null {
    try {
        const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
        if (!g.sessionStorage) return null;
        const raw = g.sessionStorage.getItem(PARTICIPANT_SESSION_KEY(gameId, teamId));
        if (!raw) return null;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) ? n : null;
    } catch {
        return null;
    }
}

function persistParticipantId(gameId: string, teamId: string, participantId: number) {
    try {
        const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
        if (!g.sessionStorage) return;
        g.sessionStorage.setItem(
            PARTICIPANT_SESSION_KEY(gameId, teamId),
            String(participantId),
        );
    } catch {
        // private mode / unavailable
    }
}
import {
    GamePhase,
    GameStatuses,
    GameStatus,
    PlayerRequestEvent,
    GameBroadcastEvent,
    PlayerResponseEvent
} from "@/src/dto/common.dto";
import { AnswerDomain, GameState, LeaderboardEntry } from "@/src/dto/game.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

export interface PlayerNotification {
    id: string;
    type: 'error' | 'info';
    message: string;
}

const NOTIFICATION_TTL_MS = 4000;
const ANSWER_ACK_TIMEOUT_MS = 6000;
// A queued answer older than this is stale by any reasonable measure —
// its question is long closed, so don't resurrect it on a later reload.
const PENDING_ANSWER_MAX_AGE_MS = 10 * 60_000;

interface PendingAnswer {
    gameId: number;
    participantId: number;
    questionId: number;
    answer: string;
    submittedAt: string;
}

const PENDING_ANSWER_KEY = (gameId: string, teamId: string) =>
    `www-player-pending-answer:${gameId}:${teamId}`;

// Persisted so that reloading the page — the very thing a player does when
// they see "connection lost" — doesn't silently throw away an answer they
// already pressed Send on.
function readStoredPendingAnswer(gameId: string, teamId: string): PendingAnswer | null {
    try {
        const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
        if (!g.sessionStorage) return null;
        const raw = g.sessionStorage.getItem(PENDING_ANSWER_KEY(gameId, teamId));
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<PendingAnswer>;
        if (
            typeof parsed?.gameId !== 'number' ||
            typeof parsed?.participantId !== 'number' ||
            typeof parsed?.questionId !== 'number' ||
            typeof parsed?.answer !== 'string' ||
            typeof parsed?.submittedAt !== 'string'
        ) {
            return null;
        }

        const age = Date.now() - Date.parse(parsed.submittedAt);
        if (!Number.isFinite(age) || age > PENDING_ANSWER_MAX_AGE_MS) return null;

        return parsed as PendingAnswer;
    } catch {
        return null;
    }
}

function persistPendingAnswer(
    gameId: string,
    teamId: string,
    pending: PendingAnswer | null,
) {
    try {
        const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
        if (!g.sessionStorage) return;
        const key = PENDING_ANSWER_KEY(gameId, teamId);
        if (pending) g.sessionStorage.setItem(key, JSON.stringify(pending));
        else g.sessionStorage.removeItem(key);
    } catch {
        // private mode / unavailable
    }
}

export function usePlayerGame(gameId: string, teamId: string, teamName: string) {
    const { t } = useTranslation();
    const socketRef = useRef<Socket | null>(null);

    const participantIdRef = useRef<number | null>(null);
    const identifiedRef = useRef(false);
    const lastSubmitRef = useRef<{ submittedAtIso: string; questionId: number } | null>(null);
    const prevPhaseRef = useRef<GamePhase | null>(null);
    const prevStatusRef = useRef<GameStatus | null>(null);
    const prevActiveQuestionIdRef = useRef<number | null>(null);
    const activeQuestionIdRef = useRef<number | null>(null);
    const wasDisconnectedRef = useRef(false);
    const notificationIdRef = useRef(0);
    // An answer the player has sent that the server hasn't acknowledged yet.
    // It's kept (and re-sent on reconnect / on watchdog tick) until the
    // server either confirms it or rejects it, so pressing Send once is
    // enough even if the connection drops at that exact moment.
    const pendingAnswerRef = useRef<PendingAnswer | null>(null);
    const pendingSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Restored during the first render (not in an effect) so the socket's
    // connect handler can never fire before we know an answer is queued.
    const pendingRestoredRef = useRef(false);
    if (!pendingRestoredRef.current) {
        pendingRestoredRef.current = true;
        pendingAnswerRef.current = readStoredPendingAnswer(gameId, teamId);
    }

    const [status, setStatus] = useState(() => t("player.status.connecting"));
    const [participantId, setParticipantId] = useState<number | null>(null);
    const [lastAnswerStatus, setLastAnswerStatus] = useState<'success' | 'error' | null>(null);
    const [notifications, setNotifications] = useState<PlayerNotification[]>([]);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const pushNotification = useCallback((type: PlayerNotification['type'], message: string) => {
        const id = `${Date.now()}-${notificationIdRef.current++}`;
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => dismissNotification(id), NOTIFICATION_TTL_MS);
    }, [dismissNotification]);

    const [gameState, setGameState] = useState<{
        phase: GamePhase;
        timer: number;
        activeQuestionId: number | null;
        activeQuestionNumber: number | null;
        activeGlobalQuestionNumber: number | null;
        gameStarted: boolean;
        gameStatus: GameStatus | null;
        isPaused: boolean;
    }>({
        phase: GamePhase.IDLE,
        timer: 0,
        activeQuestionId: null,
        activeQuestionNumber: null,
        activeGlobalQuestionNumber: null,
        gameStarted: false,
        gameStatus: null,
        isPaused: false,
    });

    const [history, setHistory] = useState<AnswerDomain[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [finishedJoinBlocked, setFinishedJoinBlocked] = useState(false);

    const trackStateTransitions = useCallback((data: GameState) => {
        const prevPhase = prevPhaseRef.current;
        const prevStatus = prevStatusRef.current;
        const prevQ = prevActiveQuestionIdRef.current;

        if (prevPhase !== null && data.phase && prevPhase !== data.phase) {
            void mixpanel.track("Player Game Phase Observed", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                from: String(prevPhase),
                to: String(data.phase),
                active_question_id: data.activeQuestionId ?? null,
                active_question_number: data.activeQuestionNumber ?? null,
                seconds: data.seconds,
            });
        }
        if (prevStatus !== null && data.status && prevStatus !== data.status) {
            void mixpanel.track("Player Game Status Observed", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                from: String(prevStatus),
                to: String(data.status),
            });
        }
        if (
            prevQ !== null &&
            data.activeQuestionId &&
            prevQ !== data.activeQuestionId
        ) {
            void mixpanel.track("Player Game Active Question Observed", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                from_question_id: prevQ,
                to_question_id: data.activeQuestionId,
                to_question_number: data.activeQuestionNumber ?? null,
            });
        }

        prevPhaseRef.current = data.phase ?? prevPhase;
        prevStatusRef.current = data.status ?? prevStatus;
        prevActiveQuestionIdRef.current = data.activeQuestionId ?? prevQ;
    }, [gameId, teamId]);

    const updateGameState = useCallback((data: GameState) => {
        trackStateTransitions(data);
        const isNeutralPhase = data.phase === GamePhase.IDLE || data.phase === GamePhase.PREPARATION;
        setGameState(prev => ({
            ...prev,
            phase: data.phase,
            timer: data.seconds,
            activeQuestionId: data.activeQuestionId ?? prev.activeQuestionId,
            activeQuestionNumber: data.activeQuestionNumber ?? prev.activeQuestionNumber,
            activeGlobalQuestionNumber: data.activeGlobalQuestionNumber ?? prev.activeGlobalQuestionNumber,
            gameStarted: data.status === GameStatuses.LIVE || data.phase !== GamePhase.IDLE,
            gameStatus: data.status ?? prev.gameStatus,
            isPaused: isNeutralPhase ? false : (data.isPaused ?? prev.isPaused),
        }));
    }, [trackStateTransitions]);

    const clearPendingSubmit = useCallback(() => {
        if (pendingSubmitTimerRef.current) {
            clearTimeout(pendingSubmitTimerRef.current);
            pendingSubmitTimerRef.current = null;
        }
        pendingAnswerRef.current = null;
        persistPendingAnswer(gameId, teamId, null);
    }, [gameId, teamId]);

    // Re-sends the queued answer with its ORIGINAL submittedAt: the server
    // derives lateness from that timestamp, so a resend caused by a dropped
    // connection can never make the answer look later than it was. saveAnswer
    // upserts per (participant, question), so a duplicate delivery is a no-op
    // rather than a second answer.
    const flushPendingAnswer = useCallback(() => {
        const pending = pendingAnswerRef.current;
        const s = socketRef.current;
        if (!pending || !s?.connected) return;

        // Send under the participant id this socket is actually bound to.
        // After a reload we normally reclaim the same slot, but if we were
        // given a new one, the id stored alongside the answer is stale and
        // the server would reject it as someone else's participant.
        const participantId = participantIdRef.current ?? pending.participantId;
        s.emit(PlayerRequestEvent.SubmitAnswer, { ...pending, participantId });
    }, []);

    const armSubmitWatchdog = useCallback(() => {
        if (pendingSubmitTimerRef.current) clearTimeout(pendingSubmitTimerRef.current);
        pendingSubmitTimerRef.current = setTimeout(() => {
            const pending = pendingAnswerRef.current;
            if (!pending) return;

            // The game moved past this question while we were still trying —
            // the answer can no longer land, so stop and say so plainly
            // instead of retrying forever against a closed question. A null
            // active question means we simply haven't heard from the server
            // yet (offline, or still syncing after a reload) — that's not
            // evidence the question is gone, so keep trying.
            const activeQuestionId = activeQuestionIdRef.current;
            if (activeQuestionId != null && activeQuestionId !== pending.questionId) {
                clearPendingSubmit();
                setLastAnswerStatus('error');
                pushNotification('error', t("playerNotifications.answerNotDelivered"));
                void mixpanel.track("Player Answer Lost", {
                    game_id: pending.gameId,
                    question_id: pending.questionId,
                });
                return;
            }

            flushPendingAnswer();
            armSubmitWatchdog();
        }, ANSWER_ACK_TIMEOUT_MS);
    }, [clearPendingSubmit, flushPendingAnswer, pushNotification, t]);

    const syncHistory = useCallback(() => {
        const id = participantIdRef.current;
        if (id) socketRef.current?.emit(PlayerRequestEvent.SyncHistory, { participantId: id });
    }, []);

    const syncLeaderboard = useCallback(() => {
        if (gameId) {
            socketRef.current?.emit(PlayerRequestEvent.SyncLeaderboard, { gameId: Number(gameId) });
        }
    }, [gameId]);

    useEffect(() => {
        const url = `${getSocketUrl()}/game`;
        let socket: Socket | null = null;
        let cancelled = false;

        const connect = async () => {
            const token = await getAccessToken();
            if (cancelled) return;
            const s = io(url, {
                transports: ['websocket'],
                ...(token ? { auth: { token } } : {}),
            });
            socket = s;
            socketRef.current = s;

        s.on('connect', () => {
            setStatus(t("player.status.team", { teamName }));
            if (wasDisconnectedRef.current) {
                wasDisconnectedRef.current = false;
                pushNotification('info', t("playerNotifications.backOnline"));
            }
            mixpanel.setSuperProps({
                role: "player",
                game_id: Number(gameId),
                team_id: Number(teamId),
            });
            void mixpanel.track("Socket Connected", { namespace: "game", role: "player" });
            void mixpanel.track("Player Join Game Emitted", {
                game_id: Number(gameId),
                team_id: Number(teamId),
            });
            // Include our own participantId if we know it (from this session
            // or a prior page load) so a reconnect after a brief network
            // drop reclaims our own slot instead of racing the server's
            // disconnect cleanup and getting told the slot is "taken".
            const knownParticipantId =
                participantIdRef.current ?? readStoredParticipantId(gameId, teamId);
            s.emit(PlayerRequestEvent.JoinGame, {
                gameId: Number(gameId),
                teamId: Number(teamId),
                ...(knownParticipantId ? { participantId: knownParticipantId } : {}),
            });

        });

        s.on(GameBroadcastEvent.SyncState, (data: { state: GameState, participantId: number }) => {
            if (data.participantId) {
                participantIdRef.current = data.participantId;
                setParticipantId(data.participantId);

                if (!identifiedRef.current) {
                    identifiedRef.current = true;
                    void mixpanel.identify(String(data.participantId));
                    mixpanel.setSuperProps({
                        participant_id: data.participantId,
                        participant_id_str: String(data.participantId),
                    });
                    void mixpanel.setPeople({
                        $name: teamName,
                        role: "player",
                        game_id: Number(gameId),
                        team_id: Number(teamId),
                        team_name: teamName,
                        participant_id: data.participantId,
                    });
                }
            }
            if (data.state) updateGameState(data.state);

            // Deliver a queued answer here rather than on 'connect': the
            // server checks that this socket owns the participant, and that
            // binding only exists once JoinGame has been processed — which
            // is exactly what receiving SyncState tells us. Covers both a
            // reconnect and a fresh load after the player reloaded the page.
            if (pendingAnswerRef.current) {
                flushPendingAnswer();
                armSubmitWatchdog();
            }
        });

        s.on(GameBroadcastEvent.TimerUpdate, (state: GameState) => updateGameState(state));

        s.on(GameBroadcastEvent.TimerPaused, () => {
            setGameState(prev => ({ ...prev, isPaused: true }));
        });

        s.on(GameBroadcastEvent.TimerResumed, () => {
            setGameState(prev => ({ ...prev, isPaused: false }));
        });

        s.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            const prev = prevStatusRef.current;
            if (prev !== data.status) {
                void mixpanel.track("Player Game Status Observed", {
                    game_id: Number(gameId),
                    team_id: Number(teamId),
                    from: prev ? String(prev) : null,
                    to: String(data.status),
                    source: "status_changed",
                });
                prevStatusRef.current = data.status;
            }
            setGameState(prev => ({
                ...prev,
                gameStarted: data.status === GameStatuses.LIVE || prev.gameStarted,
                gameStatus: data.status
            }));
        });

        s.on(PlayerResponseEvent.HistoryUpdate, (h: AnswerDomain[]) => {
            setHistory(h);
            void mixpanel.track("Player History Updated", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                count: Array.isArray(h) ? h.length : 0,
            });
        });
        s.on(GameBroadcastEvent.LeaderboardUpdate, (l: LeaderboardEntry[]) => {
            setLeaderboard(l);
            void mixpanel.track("Player Leaderboard Updated", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                count: Array.isArray(l) ? l.length : 0,
            });
        });

        s.on(PlayerResponseEvent.AnswerReceived, () => {
            clearPendingSubmit();
            setLastAnswerStatus('success');
            setStatus(t("player.status.team", { teamName }));
            const last = lastSubmitRef.current;
            if (last) {
                const latencyMs = Date.now() - Date.parse(last.submittedAtIso);
                void mixpanel.track("Player Answer Ack", {
                    game_id: Number(gameId),
                    team_id: Number(teamId),
                    participant_id: participantIdRef.current,
                    question_id: last.questionId,
                    latency_ms: Number.isFinite(latencyMs) ? latencyMs : undefined,
                });
            }
            syncHistory();
        });

        s.on('error', (err: { message?: string }) => {
            clearPendingSubmit();
            const msg = typeof err?.message === 'string' ? err.message : '';
            if (msg.includes('already finished')) {
                setFinishedJoinBlocked(true);
            } else {
                // The finished/blocked case redirects to results right away,
                // so a toast for it would just flash during navigation.
                pushNotification('error', msg || t("playerNotifications.genericError"));
            }
            setStatus(t("player.status.error", { message: msg || 'unknown' }));
            setLastAnswerStatus('error');
            void mixpanel.track("Player Socket Error", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                error_message: err?.message,
            });
        });

        s.on('disconnect', () => {
            setStatus(t("player.status.disconnected"));
            wasDisconnectedRef.current = true;
            pushNotification('error', t("playerNotifications.connectionLost"));
            void mixpanel.track("Socket Disconnected", { namespace: "game", role: "player" });
        });
        }; // end connect()

        void connect();

        return () => {
            cancelled = true;
            if (pendingSubmitTimerRef.current) {
                clearTimeout(pendingSubmitTimerRef.current);
                pendingSubmitTimerRef.current = null;
            }
            const s = socketRef.current ?? socket;
            if (s) {
                s.disconnect();
            }
            socket = null;
            socketRef.current = null;
        };
    }, [gameId, teamId, teamName, syncHistory, updateGameState]);

    useEffect(() => {
        setFinishedJoinBlocked(false);
    }, [gameId, teamId]);

    useEffect(() => {
        if (participantId != null && gameId && teamId) {
            persistParticipantId(gameId, teamId, participantId);
        }
    }, [participantId, gameId, teamId]);

    useEffect(() => {
        if (participantId) {
            syncHistory();
            syncLeaderboard();
        }
    }, [participantId, syncHistory, syncLeaderboard]);

    useEffect(() => {
        activeQuestionIdRef.current = gameState.activeQuestionId;
    }, [gameState.activeQuestionId]);

    // An answer restored from a previous page load still needs a watchdog,
    // so it gets delivered (or retired) even if this load never connects.
    useEffect(() => {
        if (!pendingAnswerRef.current) return;
        setStatus(t("player.status.queued"));
        armSubmitWatchdog();
        void mixpanel.track("Player Answer Restored From Storage", {
            game_id: Number(gameId),
            question_id: pendingAnswerRef.current.questionId,
        });
        // Mount-only: later queueing is handled by submitAnswer itself.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (gameState.phase === GamePhase.IDLE || gameState.phase === GamePhase.PREPARATION) {
            setLastAnswerStatus(null);
        }
        // A queued answer is deliberately NOT dropped here: THINKING →
        // ANSWERING is a phase change within the same question, and the
        // answer is still perfectly deliverable. The watchdog retires it
        // only once the active question itself has moved on.
    }, [gameState.phase, gameState.activeQuestionId]);

    const submitAnswer = useCallback((answerText: string) => {
        const id = participantIdRef.current;
        const canSubmit =
            socketRef.current &&
            gameState.phase !== GamePhase.IDLE &&
            gameState.phase !== GamePhase.PREPARATION &&
            id &&
            gameState.activeQuestionId;

        if (canSubmit) {
            const submittedAt = new Date().toISOString();
            const questionId = gameState.activeQuestionId!;
            lastSubmitRef.current = { submittedAtIso: submittedAt, questionId };

            void mixpanel.track("Player Answer Submitted", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                participant_id: id,
                question_id: gameState.activeQuestionId,
                question_number: gameState.activeQuestionNumber,
                phase: String(gameState.phase),
                time_left_s: gameState.timer,
                answer_length: answerText?.length ?? 0,
            });

            const pending: PendingAnswer = {
                gameId: Number(gameId),
                participantId: id,
                questionId,
                answer: answerText,
                submittedAt,
            };
            pendingAnswerRef.current = pending;
            persistPendingAnswer(gameId, teamId, pending);

            const online = socketRef.current?.connected ?? false;
            if (online) {
                flushPendingAnswer();
                setStatus(t("player.status.sending"));
            } else {
                // Queued rather than lost: the connect handler will deliver it
                // as soon as the socket is back.
                setStatus(t("player.status.queued"));
                pushNotification('info', t("playerNotifications.answerQueued"));
            }
            armSubmitWatchdog();
        }
    }, [gameId, teamId, gameState.phase, gameState.activeQuestionId, gameState.activeQuestionNumber, gameState.timer, t, flushPendingAnswer, armSubmitWatchdog, pushNotification]);

    return {
        status,
        participantId,
        ...gameState,
        lastAnswerStatus,
        history,
        leaderboard,
        submitAnswer,
        syncHistory,
        syncLeaderboard,
        finishedJoinBlocked,
        notifications,
        dismissNotification,
    };
}