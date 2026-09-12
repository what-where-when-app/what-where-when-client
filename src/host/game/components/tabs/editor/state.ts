import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import type {
    HostGameDetails,
    SaveGameRequest,
    GameQuestion,
} from "@/src/dto/game.dto";
import { roundKey, questionKey } from "./keys";
import {hostApi} from "@/src/api/host";
import {toSaveGameDraft} from "@/src/game/mappers";
import {tmpId} from "@/src/utils/tmpId";
import {UICategory, UIQuestion, UIRound, UITeam} from "@/src/host/game/components/tabs/editor/types";
import { mixpanel } from "@/src/analytics/mixpanel";

const AUTOSAVE_DEBOUNCE_MS = 1500;
const MIN_SAVING_INDICATOR_MS = 2000;

export function useGameEditor(gameIdParam: string) {
    const router = useRouter();

    const isNew = gameIdParam === "new";
    const numericGameId = isNew ? null : Number(gameIdParam);

    const [loading, setLoading] = useState(!isNew);
    const [loaded, setLoaded] = useState<HostGameDetails | null>(null);

    const [draft, setDraft] = useState<SaveGameRequest["game"]>({
        title: "",
        date_of_event: "",
        settings: {
            time_to_think_sec: 60,
            time_to_answer_sec: 10,
            time_to_dispute_end_min: 10,
            show_leaderboard: false,
            show_questions: false,
            show_answers: false,
            can_appeal: true,
        },
        categories: [],
        teams: [],
        rounds: [],
    });

    const [deletedRoundIds, setDeletedRoundIds] = useState<number[]>([]);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);
    const [deletedTeamIds, setDeletedTeamIds] = useState<number[]>([]);
    const [deletedCategoryIds, setDeletedCategoryIds] = useState<number[]>([]);

    const [saveError, setSaveError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedRoundKey, setSelectedRoundKey] = useState<string | null>(null);
    const [selectedQuestionKey, setSelectedQuestionKey] = useState<string | null>(null);

    // Guards against overlapping saves: if an edit triggers another save
    // request while one is already in flight (autosave firing right as the
    // manual button is pressed, or two autosaves racing), we don't fire a
    // second request — we just remember to save again once the current one
    // finishes, so the latest edits are never dropped.
    const isSavingRef = useRef(false);
    const pendingSaveRef = useRef(false);
    const saveNowRef = useRef<() => Promise<void>>(async () => {});
    // Bumped on every save attempt so a delayed hide-timer from an earlier
    // (already-superseded) save can't cut short a newer one's minimum
    // display time.
    const savingGenerationRef = useRef(0);
    const draftRef = useRef(draft);
    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    const load = useCallback(async () => {
        if (isNew || numericGameId == null || Number.isNaN(numericGameId)) return;

        const t0 = Date.now();
        setLoading(true);
        setSaveError(null);
        try {
            const res = await hostApi.getGame({ gameId: numericGameId });
            setLoaded(res.game);
            setDraft(toSaveGameDraft(res.game));

            setDeletedRoundIds([]);
            setDeletedQuestionIds([]);
            setDeletedTeamIds([]);
            setDeletedCategoryIds([]);
            setIsDirty(false);

            setSelectedRoundKey(null);
            setSelectedQuestionKey(null);

            void mixpanel.track("Host Editor Loaded", {
                game_id: numericGameId,
                version: res.game?.version,
                rounds_count: res.game?.rounds?.length ?? 0,
                response_time_ms: Date.now() - t0,
            });
        } catch (e: any) {
            const message = e?.message ?? "Failed to load game. Please try again.";
            setSaveError(message);
            void mixpanel.track("Host Editor Load Failed", {
                game_id: numericGameId,
                error_message: message,
                status: e?.status,
                response_time_ms: Date.now() - t0,
            });
        } finally {
            setLoading(false);
        }
    }, [isNew, numericGameId]);

    useEffect(() => {
        void load();
    }, [load]);

    const rounds = (draft.rounds as UIRound[]) ?? [];

    const selectedRound = useMemo(() => {
        if (!rounds.length) return null;
        return rounds.find((r) => roundKey(r) === selectedRoundKey) ?? rounds[0];
    }, [rounds, selectedRoundKey]);

    const questions = ((selectedRound?.questions as UIQuestion[]) ?? []);

    const selectedQuestion = useMemo(() => {
        if (!questions.length) return null;
        return questions.find((q) => questionKey(q) === selectedQuestionKey) ?? questions[0];
    }, [questions, selectedQuestionKey]);

    useEffect(() => {
        if (!selectedRoundKey && rounds.length) setSelectedRoundKey(roundKey(rounds[0]));
    }, [rounds.length]);

    useEffect(() => {
        if (selectedRound && !selectedQuestionKey && (selectedRound.questions?.length ?? 0) > 0) {
            setSelectedQuestionKey(questionKey((selectedRound.questions as any[])[0]));
        }
    }, [selectedRoundKey, selectedRound?.questions?.length]);

    function setTitle(v: string) {
        setDraft((d) => ({ ...d, title: v }));
        setIsDirty(true);
    }

    function updateSettings(next: SaveGameRequest["game"]["settings"]) {
        setDraft((d) => ({ ...d, settings: next }));
        setIsDirty(true);
    }

    function setDate(v: string) {
        setDraft((d) => ({ ...d, date_of_event: v }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Date Changed", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            has_value: Boolean(v),
        });
    }

    async function primaryAction() {
        if (isNew) {
            if (isSubmitting) return;
            setSaveError(null);
            if (!draft.title.trim()) return;
            if (!draft.date_of_event.trim()) return;

            setIsSubmitting(true);
            void mixpanel.track("Host Game Create Submitted");
            try {
                const res = await hostApi.createGame({
                    title: draft.title.trim(),
                    date_of_event: draft.date_of_event.trim(),
                });
                void mixpanel.track("Host Game Create Succeeded", { game_id: res.game?.id });
                router.replace(`/game/${res.game.id}`);
            } catch (e: any) {
                const message = e?.message ?? "Failed to create game. Please try again.";
                setSaveError(message);
                void mixpanel.track("Host Game Create Failed", {
                    error_message: message,
                    status: e?.status,
                });
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        await saveNow();
    }

    // The actual persist-to-server call for an existing game. Used by both
    // the manual "Save all changes" button (via primaryAction) and the
    // autosave debounce effect below.
    async function saveNow() {
        if (isNew || !loaded) return;

        if (isSavingRef.current) {
            pendingSaveRef.current = true;
            return;
        }

        const cleanDraft = {
            ...draft,
            categories: draft.categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                description: c.description,
            })),
            teams: draft.teams.map((t: any) => ({
                id: t.id,
                name: t.name,
                team_code: t.team_code,
                category_id: t.category_id || t.categoryId,
            })),
            rounds: draft.rounds.map((r: any) => ({
                id: r.id,
                round_number: r.round_number,
                name: r.name,
                questions: r.questions.map((q: any) => ({
                    id: q.id,
                    round_id: q.round_id,
                    question_number: q.question_number,
                    text: q.text,
                    answer: q.answer,
                    time_to_think_sec: q.time_to_think_sec,
                    time_to_answer_sec: q.time_to_answer_sec,
                })),
            })),
        };

        const body: SaveGameRequest = {
            game_id: loaded.id,
            version: loaded.version,
            game: cleanDraft,
            deleted_round_ids: deletedRoundIds.length ? deletedRoundIds : undefined,
            deleted_question_ids: deletedQuestionIds.length ? deletedQuestionIds : undefined,
            deleted_team_ids: deletedTeamIds.length ? deletedTeamIds : undefined,
            deleted_category_ids: deletedCategoryIds.length ? deletedCategoryIds : undefined,
        };

        const totalQuestions = (draft.rounds as any[])?.reduce(
            (acc: number, r: any) => acc + (r?.questions?.length ?? 0),
            0,
        ) ?? 0;

        void mixpanel.track("Host Game Saved Submitted", {
            game_id: loaded.id,
            rounds_count: (draft.rounds as any[])?.length ?? 0,
            teams_count: (draft.teams as any[])?.length ?? 0,
            categories_count: (draft.categories as any[])?.length ?? 0,
            questions_count: totalQuestions,
            deleted_rounds_count: deletedRoundIds.length,
            deleted_questions_count: deletedQuestionIds.length,
            deleted_teams_count: deletedTeamIds.length,
            deleted_categories_count: deletedCategoryIds.length,
        });
        const draftSentInThisRequest = draft;

        setSaveError(null);
        setIsSubmitting(true);
        isSavingRef.current = true;
        const t0 = Date.now();
        const generation = ++savingGenerationRef.current;
        try {
            const res = await hostApi.saveGame(body);
            void mixpanel.track("Host Game Saved Succeeded", {
                game_id: res.game?.id,
                version: res.game?.version,
                response_time_ms: Date.now() - t0,
            });

            setLoaded(res.game);

            // Only replace the draft (and clear pending-deletion tracking)
            // with the server's version if nothing changed locally while
            // this request was in flight — otherwise we'd visibly stomp an
            // edit, or forget a deletion, the user just made using the
            // (now stale) response we started this request with.
            if (draftRef.current === draftSentInThisRequest) {
                setDraft(toSaveGameDraft(res.game));
                setIsDirty(false);
                setDeletedRoundIds([]);
                setDeletedQuestionIds([]);
                setDeletedTeamIds([]);
                setDeletedCategoryIds([]);
            }
        } catch (e: any) {
            const message = e?.message ?? "Failed to save. Please try again.";
            setSaveError(message);
            void mixpanel.track("Host Game Saved Failed", {
                game_id: loaded.id,
                error_message: message,
                status: e?.status,
                response_time_ms: Date.now() - t0,
            });
        } finally {
            isSavingRef.current = false;

            // Keep the "Saving…" indicator up for a minimum stretch so a
            // fast save doesn't just flash on screen for a fraction of a
            // second — but only if no newer save has started since.
            const hideSavingIndicator = () => {
                if (savingGenerationRef.current === generation) {
                    setIsSubmitting(false);
                }
            };
            const remaining = MIN_SAVING_INDICATOR_MS - (Date.now() - t0);
            if (remaining > 0) {
                setTimeout(hideSavingIndicator, remaining);
            } else {
                hideSavingIndicator();
            }

            if (pendingSaveRef.current) {
                pendingSaveRef.current = false;
                void saveNowRef.current();
            }
        }
    }

    useEffect(() => {
        saveNowRef.current = saveNow;
    });

    // Autosave: after AUTOSAVE_DEBOUNCE_MS of no further edits, persist
    // automatically. Only applies once a game exists — the initial create
    // step still requires an explicit click (see saveHostGame's DRAFT-only
    // edit lock and the deliberately-deferred "orphaned empty games" issue).
    useEffect(() => {
        if (isNew || !isDirty) return;
        const timer = setTimeout(() => {
            void saveNowRef.current();
        }, AUTOSAVE_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft, isNew]);

    // ---- Categories ----
    function addCategory(name: string, description?: string) {
        const n = name.trim();
        if (!n) return;

        const next: UICategory = {
            _tmpId: tmpId("cat"),
            name: n,
            description: description?.trim() || undefined,
        };

        setDraft((d) => ({ ...d, categories: [...(d.categories as UICategory[]), next] }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Category Added", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            name_length: n.length,
            has_description: Boolean(description?.trim()),
        });
    }

    function updateCategory(cat: UICategory, name: string, description?: string) {
        const n = name.trim();
        if (!n) return;
        setDraft((d) => ({
            ...d,
            categories: (d.categories as UICategory[]).map((c) =>
                (cat.id ? c.id === cat.id : c._tmpId === cat._tmpId)
                    ? { ...c, name: n, description: description?.trim() || undefined }
                    : c
            ),
        }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Category Updated", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            category_id: cat.id ?? null,
            name_changed: cat.name !== n,
            description_changed: (cat.description ?? "") !== (description?.trim() ?? ""),
        });
    }

    function removeCategory(cat: UICategory) {
        if (cat.id) setDeletedCategoryIds((prev) => (prev.includes(cat.id!) ? prev : [...prev, cat.id!]));

        setDraft((d) => ({
            ...d,
            categories: (d.categories as UICategory[]).filter((c) =>
                cat.id ? c.id !== cat.id : c._tmpId !== cat._tmpId
            ),
        }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Category Removed", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            category_id: cat.id ?? null,
            was_persisted: Boolean(cat.id),
        });
    }

    // ---- Teams ----
    function addTeam(name: string, code: string, categoryId: number) {
        const n = name.trim();
        const c = code.trim().toUpperCase().replace(/\s+/g, "");
        if (!n) return;

        const next: UITeam & { category_id?: number | null } = {
            _tmpId: tmpId("team"),
            name: n,
            team_code: c,
            category_id: categoryId
        };
        setDraft((d) => ({ ...d, teams: [...(d.teams as UITeam[]), next] }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Team Added", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            category_id: categoryId,
            name_length: n.length,
            code_length: c.length,
        });
    }

    function updateTeam(team: UITeam, name: string, code: string, categoryId: number) {
        const n = name.trim();
        const c = code.trim().toUpperCase().replace(/\s+/g, "");
        if (!n) return;
        setDraft((d) => ({
            ...d,
            teams: (d.teams as UITeam[]).map((t) =>
                (team.id ? t.id === team.id : t._tmpId === team._tmpId)
                    ? { ...t, name: n, team_code: c, category_id: categoryId }
                    : t
            ),
        }));
        setIsDirty(true);
        const prevCategoryId = (team as any).category_id ?? (team as any).categoryId ?? null;
        void mixpanel.track("Host Editor Team Updated", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            team_id: team.id ?? null,
            name_changed: team.name !== n,
            code_changed: ((team as any).team_code ?? "") !== c,
            category_changed: prevCategoryId !== categoryId,
            category_id: categoryId,
        });
    }

    function removeTeam(team: UITeam) {
        if (team.id) setDeletedTeamIds((prev) => (prev.includes(team.id!) ? prev : [...prev, team.id!]));

        setDraft((d) => ({
            ...d,
            teams: (d.teams as UITeam[]).filter((t) => (team.id ? t.id !== team.id : t._tmpId !== team._tmpId)),
        }));
        setIsDirty(true);
        void mixpanel.track("Host Editor Team Removed", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            team_id: team.id ?? null,
            was_persisted: Boolean(team.id),
        });
    }

    // ---- Rounds / Questions ----
    function addRound() {
        const nextRoundNumber = rounds.length ? Math.max(...rounds.map((r) => r.round_number)) + 1 : 1;

        const r: UIRound = {
            _tmpId: tmpId("round"),
            round_number: nextRoundNumber,
            name: `Round ${nextRoundNumber}`,
            questions: [],
        };

        setDraft((d) => ({ ...d, rounds: [...(d.rounds as UIRound[]), r] }));
        setSelectedRoundKey(roundKey(r));
        setSelectedQuestionKey(null);
        setIsDirty(true);
        void mixpanel.track("Host Editor Round Added", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_number: nextRoundNumber,
            total_rounds: rounds.length + 1,
        });
    }

    function removeRound(r: UIRound) {
        if (r.id) setDeletedRoundIds((prev) => (prev.includes(r.id!) ? prev : [...prev, r.id!]));
        (r.questions as any[])?.forEach((q) => {
            if (q?.id) setDeletedQuestionIds((prev) => (prev.includes(q.id) ? prev : [...prev, q.id]));
        });

        setDraft((d) => ({ ...d, rounds: (d.rounds as UIRound[]).filter((x) => roundKey(x) !== roundKey(r)) }));

        if (selectedRoundKey === roundKey(r)) {
            setSelectedRoundKey(null);
            setSelectedQuestionKey(null);
        }
        setIsDirty(true);
        void mixpanel.track("Host Editor Round Removed", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_id: r.id ?? null,
            round_number: r.round_number,
            questions_in_round: (r.questions as any[])?.length ?? 0,
            was_persisted: Boolean(r.id),
        });
    }

    function addQuestion() {
        if (!selectedRound) return;

        const rk = roundKey(selectedRound);

        const next = rounds.map((r) => {
            if (roundKey(r) !== rk) return r;

            const qs = (r.questions as UIQuestion[]) ?? [];
            const nextNumber = qs.length ? Math.max(...qs.map((q) => q.question_number)) + 1 : 1;

            const q: UIQuestion = {
                _tmpId: tmpId("q"),
                round_id: r.id,
                question_number: nextNumber,
                text: "",
                answer: "",
                time_to_think_sec: draft.settings.time_to_think_sec,
                time_to_answer_sec: draft.settings.time_to_answer_sec,
            };

            return { ...r, questions: [...qs, q] };
        });

        setDraft((d) => ({ ...d, rounds: next }));

        const updatedRound = next.find((r) => roundKey(r) === rk);
        const created = updatedRound?.questions?.[(updatedRound.questions as any[]).length - 1] as any;
        setSelectedQuestionKey(created ? questionKey(created) : null);
        setIsDirty(true);
        void mixpanel.track("Host Editor Question Added", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_id: selectedRound.id ?? null,
            round_number: selectedRound.round_number,
            question_number: created?.question_number,
            total_questions_in_round: updatedRound?.questions?.length ?? 0,
        });
    }

    function removeQuestion(q: UIQuestion) {
        if (!selectedRound) return;

        if (q.id) setDeletedQuestionIds((prev) => (prev.includes(q.id!) ? prev : [...prev, q.id!]));

        const rk = roundKey(selectedRound);
        const qk = questionKey(q);

        const next = rounds.map((r) => {
            if (roundKey(r) !== rk) return r;
            return { ...r, questions: (r.questions as UIQuestion[]).filter((x) => questionKey(x) !== qk) };
        });

        setDraft((d) => ({ ...d, rounds: next }));

        if (selectedQuestionKey === qk) setSelectedQuestionKey(null);
        setIsDirty(true);
        void mixpanel.track("Host Editor Question Removed", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_id: selectedRound.id ?? null,
            round_number: selectedRound.round_number,
            question_id: q.id ?? null,
            question_number: q.question_number,
            was_persisted: Boolean(q.id),
        });
    }

    function updateSelectedQuestion(patch: Partial<GameQuestion>) {
        if (!selectedRound || !selectedQuestion) return;

        const rk = roundKey(selectedRound);
        const qk = questionKey(selectedQuestion);

        const next = rounds.map((r) => {
            if (roundKey(r) !== rk) return r;
            return {
                ...r,
                questions: (r.questions as UIQuestion[]).map((q) =>
                    questionKey(q) === qk ? { ...q, ...patch } : q
                ),
            };
        });

        setDraft((d) => ({ ...d, rounds: next }));
        setIsDirty(true);
    }

    function selectRound(k: string) {
        setSelectedRoundKey(k);
        setSelectedQuestionKey(null);
        const target = rounds.find((r) => roundKey(r) === k);
        void mixpanel.track("Host Editor Round Selected", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_id: target?.id ?? null,
            round_number: target?.round_number,
        });
    }

    function updateSelectedRoundName(name: string) {
        if (!selectedRound) return;
        const rk = roundKey(selectedRound);
        setDraft((d) => ({
            ...d,
            rounds: (d.rounds as UIRound[]).map((r) =>
                roundKey(r) === rk ? { ...r, name } : r
            ),
        }));
        setIsDirty(true);
    }

    function selectQuestion(k: string) {
        setSelectedQuestionKey(k);
        const target = (selectedRound?.questions as UIQuestion[] | undefined)?.find(
            (q) => questionKey(q) === k,
        );
        void mixpanel.track("Host Editor Question Selected", {
            game_id: numericGameId ?? null,
            is_new: isNew,
            round_id: selectedRound?.id ?? null,
            round_number: selectedRound?.round_number,
            question_id: target?.id ?? null,
            question_number: target?.question_number,
        });
    }

    return {
        isNew,
        loading,
        loaded,
        draft,
        saveError,
        isDirty,
        isSubmitting,
        reload: load,

        selectedRoundKey,
        selectedQuestionKey,
        rounds,
        selectedRound,
        questions,
        selectedQuestion,

        setDraft,
        setTitle,
        setDate,
        updateSettings,
        primaryAction,

        addCategory,
        updateCategory,
        removeCategory,
        addTeam,
        updateTeam,
        removeTeam,

        addRound,
        removeRound,
        addQuestion,
        removeQuestion,
        updateSelectedQuestion,
        selectRound,
        selectQuestion,
        updateSelectedRoundName,
    };
}
