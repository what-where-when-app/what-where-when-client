import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { AnswerDomain } from "@/src/dto/game.dto";
import { AnswerStatus } from "@/src/dto/common.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

interface Props {
    rounds: any[];
    answers: AnswerDomain[];
    onJudge: (id: number, verdict: AnswerStatus) => void;
    onJudgeBulk?: (ids: number[], verdict: AnswerStatus) => void;
    activeQuestionId?: number;
    totalParticipants?: number;
}

interface AnswerGroup {
    key: string;
    displayText: string;
    answers: AnswerDomain[];
    status: 'unset' | 'correct' | 'incorrect' | 'mixed';
    matchesAccepted: boolean;
    charactersOff: number | null;
}

type QuestionStatus = 'notPlayed' | 'waiting' | 'judged';

const ACCEPT_LATE_UNDER_SECONDS = 2;

export const AnswersDashboard = ({ rounds, answers, onJudge, onJudgeBulk, activeQuestionId, totalParticipants }: Props) => {
    const { t } = useTranslation();
    const allQuestions = useMemo(() => rounds.flatMap(r => r.questions), [rounds]);
    const [selectedQId, setSelectedQId] = useState<number | null>(() => {
        return activeQuestionId || allQuestions[0]?.id || null;
    });

    const currentAnswers = useMemo(() =>
            answers.filter(a => a.questionId === selectedQId),
        [answers, selectedQId]);

    const activeQuestion = allQuestions.find(q => q.id === selectedQId);

    const correctCount = currentAnswers.filter(a => a.status === AnswerStatus.CORRECT).length;
    const incorrectCount = currentAnswers.filter(a => a.status === AnswerStatus.INCORRECT).length;
    const judgedAnswerCount = correctCount + incorrectCount;

    // Late answers are excluded from grouping entirely and judged one by one —
    // grouping them could silently bundle a late submission in with an
    // on-time verdict the host never meant to apply to it.
    const lateAnswers = useMemo(() => currentAnswers.filter(a => !!a.lateBySeconds), [currentAnswers]);
    const onTimeAnswers = useMemo(() => currentAnswers.filter(a => !a.lateBySeconds), [currentAnswers]);

    // groupKey/matchesAccepted/charactersOff are computed server-side (per
    // answer, from the question's accepted answer) — this just buckets
    // already-computed facts, no text comparison happens on the client.
    const groups = useMemo<AnswerGroup[]>(() => {
        const byKey = new Map<string, AnswerDomain[]>();
        onTimeAnswers.forEach(ans => {
            const existing = byKey.get(ans.groupKey);
            if (existing) existing.push(ans);
            else byKey.set(ans.groupKey, [ans]);
        });

        const result: AnswerGroup[] = Array.from(byKey.entries()).map(([key, members]) => {
            const allCorrect = members.every(m => m.status === AnswerStatus.CORRECT);
            const allIncorrect = members.every(m => m.status === AnswerStatus.INCORRECT);
            const allUnset = members.every(m => m.status === AnswerStatus.UNSET);
            const status: AnswerGroup['status'] =
                allUnset ? 'unset' : allCorrect ? 'correct' : allIncorrect ? 'incorrect' : 'mixed';

            return {
                key,
                displayText: members[0].answerText,
                answers: members,
                status,
                matchesAccepted: members[0].matchesAccepted,
                charactersOff: members[0].charactersOff,
            };
        });

        result.sort((a, b) => {
            if (a.matchesAccepted !== b.matchesAccepted) return a.matchesAccepted ? -1 : 1;
            const aJudged = a.status === 'correct' || a.status === 'incorrect';
            const bJudged = b.status === 'correct' || b.status === 'incorrect';
            if (aJudged !== bJudged) return aJudged ? 1 : -1;
            return b.answers.length - a.answers.length;
        });

        return result;
    }, [onTimeAnswers]);

    const groupIndexByKey = useMemo(() => {
        const map = new Map<string, number>();
        groups.forEach((g, i) => map.set(g.key, i + 1));
        return map;
    }, [groups]);

    const getLateHint = (ans: AnswerDomain): string => {
        if (ans.matchesAccepted) return t("hostAnswersDashboard.matchesAcceptedHint");
        const idx = groupIndexByKey.get(ans.groupKey);
        return idx ? t("hostAnswersDashboard.matchesGroupHint", { index: idx }) : '';
    };

    const itemsLeft = groups.filter(g => g.status === 'unset' || g.status === 'mixed').length
        + lateAnswers.filter(a => a.status === AnswerStatus.UNSET).length;
    const progressPct = currentAnswers.length > 0
        ? Math.round((judgedAnswerCount / currentAnswers.length) * 100)
        : 0;

    // Per-question judged/waiting/not-played status, across every round —
    // used by the navigator above, not just the selected question.
    const questionStatusById = useMemo(() => {
        const map = new Map<number, QuestionStatus>();
        allQuestions.forEach((q: any) => {
            const qAnswers = answers.filter(a => a.questionId === q.id);
            if (qAnswers.length === 0) {
                map.set(q.id, 'notPlayed');
            } else if (qAnswers.every(a => a.status === AnswerStatus.CORRECT || a.status === AnswerStatus.INCORRECT)) {
                map.set(q.id, 'judged');
            } else {
                map.set(q.id, 'waiting');
            }
        });
        return map;
    }, [answers, allQuestions]);

    const judgeIds = (ids: number[], verdict: AnswerStatus, meta: Record<string, unknown> = {}) => {
        void mixpanel.track("Host Answer Group Judged", {
            question_id: selectedQId,
            verdict,
            count: ids.length,
            ...meta,
        });
        if (onJudgeBulk) {
            onJudgeBulk(ids, verdict);
        } else {
            ids.forEach(id => onJudge(id, verdict));
        }
    };

    const acceptLateUnderThreshold = () => {
        const ids = lateAnswers.filter(a => (a.lateBySeconds ?? 0) < ACCEPT_LATE_UNDER_SECONDS).map(a => a.id);
        if (ids.length === 0) return;
        judgeIds(ids, AnswerStatus.CORRECT, { late_bulk: 'under_threshold', threshold_seconds: ACCEPT_LATE_UNDER_SECONDS });
    };

    const rejectAllLate = () => {
        const ids = lateAnswers.map(a => a.id);
        if (ids.length === 0) return;
        judgeIds(ids, AnswerStatus.INCORRECT, { late_bulk: 'reject_all' });
    };

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ margin: 10 }} showsVerticalScrollIndicator={false}>

                <Box style={styles.navCard}>
                    <Box style={{ gap: 10 }}>
                        {rounds.map((round) => {
                            const roundQuestions = round.questions || [];
                            const waitingCount = roundQuestions.filter((q: any) => questionStatusById.get(q.id) === 'waiting').length;
                            const allNotPlayed = roundQuestions.length > 0 && roundQuestions.every((q: any) => questionStatusById.get(q.id) === 'notPlayed');

                            return (
                                <Box key={round.id || round._tmpId} row align="center" style={{ gap: 12 }}>
                                    <Text style={styles.roundLabel} numberOfLines={1}>
                                        {(round.name || t("hostAnswersDashboard.roundFallback", { n: round.round_number })).toUpperCase()}
                                    </Text>

                                    <Box row style={{ flex: 1, gap: 5, flexWrap: 'wrap' }}>
                                        {roundQuestions.map((q: any) => {
                                            const isSelected = q.id === selectedQId;
                                            const status = questionStatusById.get(q.id) ?? 'notPlayed';

                                            return (
                                                <TouchableOpacity
                                                    key={q.id || q._tmpId}
                                                    onPress={() => {
                                                        void mixpanel.track("Host Answers Question Selected", {
                                                            question_id: q.id ?? null,
                                                            question_number: q.question_number,
                                                            round_id: round.id ?? null,
                                                            round_number: round.round_number,
                                                            from_question_id: selectedQId ?? null,
                                                            is_active: q.id === activeQuestionId,
                                                        });
                                                        setSelectedQId(q.id);
                                                    }}
                                                    style={[
                                                        styles.navCircle,
                                                        status === 'judged' && styles.navCircleJudged,
                                                        status === 'waiting' && styles.navCircleWaiting,
                                                        isSelected && styles.navCircleSelected,
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.navCircleText,
                                                        status === 'judged' && styles.navCircleTextJudged,
                                                        status === 'waiting' && styles.navCircleTextWaiting,
                                                        isSelected && styles.navCircleTextSelected,
                                                    ]}>
                                                        {q.question_number}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </Box>

                                    <Text style={waitingCount > 0 ? styles.roundStatusWaiting : styles.roundStatusNeutral}>
                                        {waitingCount > 0
                                            ? t("hostAnswersDashboard.roundWaiting", { count: waitingCount })
                                            : allNotPlayed
                                                ? t("hostAnswersDashboard.notPlayed")
                                                : ''}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box row align="center" style={styles.navLegend}>
                        <Box row align="center" style={{ gap: 6 }}>
                            <Box style={[styles.legendDot, { backgroundColor: colors.success.medium }]} />
                            <Text style={styles.legendText}>{t("hostAnswersDashboard.judged")}</Text>
                        </Box>
                        <Box row align="center" style={{ gap: 6 }}>
                            <Box style={[styles.legendDot, { backgroundColor: colors.error.medium }]} />
                            <Text style={styles.legendText}>{t("hostAnswersDashboard.waiting")}</Text>
                        </Box>
                        <Box row align="center" style={{ gap: 6 }}>
                            <Box style={[styles.legendDot, { backgroundColor: colors.neutralLight.darkest }]} />
                            <Text style={styles.legendText}>{t("hostAnswersDashboard.notPlayed")}</Text>
                        </Box>
                    </Box>
                </Box>

                {activeQuestion?.text ? (
                    <Text variant="bodyM" style={{ color: colors.neutralDark.medium, lineHeight: 24, marginBottom: 10 }}>
                        {activeQuestion.text}
                    </Text>
                ) : null}

                {activeQuestion && (
                    <Box row align="center" style={styles.acceptedCard}>
                        <Box row align="center" style={{ flex: 1, gap: 12, flexWrap: 'wrap' }}>
                            <Text style={styles.acceptedLabel}>{t("hostAnswersDashboard.acceptedLabel")}</Text>
                            <Text style={{ fontSize: 21, fontWeight: '800', color: colors.neutralDark.darkest }}>
                                {activeQuestion.answer || t("hostAnswersDashboard.noAcceptedAnswer")}
                            </Text>
                        </Box>

                        <Box style={{ width: 230, gap: 6 }}>
                            <Box row align="baseline" justify="space-between">
                                <Text>
                                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.neutralDark.darkest }}>
                                        {judgedAnswerCount}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: colors.neutralDark.lightest }}>
                                        {" / "}{currentAnswers.length} {t("hostAnswersDashboard.judgedSuffix")}
                                    </Text>
                                </Text>
                                {itemsLeft > 0 && (
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.warning.dark }}>
                                        {t("hostAnswersDashboard.itemsLeft", { count: itemsLeft })}
                                    </Text>
                                )}
                            </Box>
                            <Box style={styles.progressTrack}>
                                <Box style={[styles.progressFill, { width: `${progressPct}%` }]} />
                            </Box>
                        </Box>
                    </Box>
                )}

                <Box row align="center" style={{ marginBottom: 10, marginTop: 10, gap: 16, flexWrap: 'wrap' }}>
                    <Box row align="center" style={[styles.badge, styles.badgeBlue]}>
                        <Text style={[styles.badgeText, styles.badgeTextBlue]}>
                            {t("hostAnswersDashboard.total", { count: currentAnswers.length })}
                        </Text>
                    </Box>
                    <Box row align="center" style={[styles.badge, styles.badgeGreen]}>
                        <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                            {t("hostAnswersDashboard.correct", { count: correctCount })}
                        </Text>
                    </Box>
                    <Box row align="center" style={[styles.badge, styles.badgeRed]}>
                        <Text style={[styles.badgeText, styles.badgeTextRed]}>
                            {t("hostAnswersDashboard.incorrect", { count: incorrectCount })}
                        </Text>
                    </Box>
                </Box>

                <Box style={{ gap: 12 }}>
                    {groups.length === 0 && lateAnswers.length === 0 ? (
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center', padding: 20 }}>
                            {t("hostAnswersDashboard.empty")}
                        </Text>
                    ) : (
                        groups.map((group, index) => {
                            const isCorrect = group.status === 'correct';
                            const isWrong = group.status === 'incorrect';
                            const acceptFilled = isCorrect || (group.matchesAccepted && group.status === 'unset');

                            return (
                                <Box
                                    key={group.key}
                                    style={[
                                        styles.groupCard,
                                        group.matchesAccepted && styles.groupCardAccepted,
                                        (isCorrect || isWrong) && styles.groupCardJudged,
                                    ]}
                                >
                                    <Box row align="center" style={{ gap: 18 }}>
                                        <Box style={[styles.groupNumber, group.matchesAccepted && styles.groupNumberActive]}>
                                            <Text style={{ fontWeight: '800', fontSize: 14, color: group.matchesAccepted ? '#fff' : colors.neutralDark.medium }}>
                                                {index + 1}
                                            </Text>
                                        </Box>

                                        <Box style={{ flex: 1, gap: 8 }}>
                                            <Box row align="center" style={{ gap: 12, flexWrap: 'wrap' }}>
                                                <Text style={{
                                                    fontWeight: '800',
                                                    fontSize: group.matchesAccepted ? 24 : 20,
                                                    color: colors.neutralDark.darkest,
                                                }}>
                                                    {group.displayText || t("hostAnswersDashboard.noAnswerText")}
                                                </Text>

                                                {group.matchesAccepted && (
                                                    <Box style={[styles.tag, styles.tagGreen]}>
                                                        <Text style={[styles.tagText, styles.tagTextGreen]}>
                                                            {t("hostAnswersDashboard.matchesAccepted")}
                                                        </Text>
                                                    </Box>
                                                )}

                                                {group.charactersOff != null && (
                                                    <Box style={[styles.tag, styles.tagOrange]}>
                                                        <Text style={[styles.tagText, styles.tagTextOrange]}>
                                                            {t("hostAnswersDashboard.charactersOff", { count: group.charactersOff })}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box row style={{ gap: 8, flexWrap: 'wrap' }}>
                                                {group.answers.map(a => (
                                                    <Box key={a.id} style={styles.teamPill}>
                                                        <Text style={{ fontSize: 13, color: colors.neutralDark.medium }}>
                                                            {a.teamName}
                                                        </Text>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>

                                        <Box row align="center" style={{ gap: 10 }}>
                                            <TouchableOpacity
                                                style={[styles.groupReject, isWrong && styles.groupRejectActive]}
                                                onPress={() => judgeIds(group.answers.map(a => a.id), AnswerStatus.INCORRECT, {
                                                    group_size: group.answers.length,
                                                    matches_accepted: group.matchesAccepted,
                                                })}
                                            >
                                                <Feather name="x" size={18} color={isWrong ? '#fff' : colors.error.dark} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.groupAccept, acceptFilled && styles.groupAcceptActive]}
                                                onPress={() => judgeIds(group.answers.map(a => a.id), AnswerStatus.CORRECT, {
                                                    group_size: group.answers.length,
                                                    matches_accepted: group.matchesAccepted,
                                                })}
                                            >
                                                <Feather name="check" size={16} color={acceptFilled ? '#fff' : colors.success.dark} />
                                                <Text style={{ fontWeight: '800', fontSize: 14, color: acceptFilled ? '#fff' : colors.success.dark }}>
                                                    {t("hostAnswersDashboard.acceptAll", { count: group.answers.length })}
                                                </Text>
                                            </TouchableOpacity>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })
                    )}

                    {lateAnswers.length > 0 && (
                        <Box style={styles.lateSection}>
                            <Box row align="center" style={{ gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
                                <Box style={[styles.tag, styles.tagOrange]}>
                                    <Text style={[styles.tagText, styles.tagTextOrange]}>
                                        {t("hostAnswersDashboard.lateSectionBadge", { count: lateAnswers.length })}
                                    </Text>
                                </Box>
                                <Text variant="bodyM" style={{ fontWeight: '600', color: colors.neutralDark.darkest }}>
                                    {t("hostAnswersDashboard.lateSectionTitle")}
                                </Text>

                                <Box style={{ flex: 1 }} />

                                <TouchableOpacity onPress={acceptLateUnderThreshold}>
                                    <Text style={styles.lateSectionLink}>
                                        {t("hostAnswersDashboard.acceptUnderButton", { seconds: ACCEPT_LATE_UNDER_SECONDS })}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={rejectAllLate}>
                                    <Text style={styles.lateSectionLink}>
                                        {t("hostAnswersDashboard.rejectAllLate")}
                                    </Text>
                                </TouchableOpacity>
                            </Box>

                            <Box style={{ gap: 8 }}>
                                {lateAnswers.map(a => {
                                    const isCorrect = a.status === AnswerStatus.CORRECT;
                                    const isWrong = a.status === AnswerStatus.INCORRECT;
                                    const hint = getLateHint(a);

                                    return (
                                        <Box key={a.id} row align="center" style={styles.lateRow}>
                                            <Text style={{ width: 130, fontWeight: '600', fontSize: 14, color: colors.neutralDark.darkest }} numberOfLines={1}>
                                                {a.teamName}
                                            </Text>
                                            <Text style={{ flex: 1, fontSize: 15, color: colors.neutralDark.darkest }} numberOfLines={1}>
                                                {a.answerText || t("hostAnswersDashboard.noAnswerText")}
                                            </Text>
                                            <Box style={[styles.tag, styles.tagRed]}>
                                                <Text style={[styles.tagText, styles.tagTextRed]}>
                                                    {t("hostAnswersDashboard.lateBy", { seconds: a.lateBySeconds })}
                                                </Text>
                                            </Box>
                                            <Text style={{ width: 140, fontSize: 12, color: colors.neutralDark.light }} numberOfLines={1}>
                                                {hint}
                                            </Text>
                                            <Box row style={{ gap: 8 }}>
                                                <TouchableOpacity
                                                    style={[styles.lateActionCircle, isWrong && styles.actionCircleWrong]}
                                                    onPress={() => onJudge(a.id, AnswerStatus.INCORRECT)}
                                                >
                                                    <Feather name="x" size={15} color={isWrong ? '#fff' : colors.neutralDark.medium} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.lateActionCircle, isCorrect && styles.actionCircleCorrect]}
                                                    onPress={() => onJudge(a.id, AnswerStatus.CORRECT)}
                                                >
                                                    <Feather name="check" size={15} color={isCorrect ? '#fff' : colors.neutralDark.medium} />
                                                </TouchableOpacity>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </Box>
            </ScrollView>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navCard: {
        backgroundColor: colors.neutralLight.lightest,
        padding: 18,
        marginBottom: 10,
        borderRadius: 16,
    },
    roundLabel: {
        width: 110,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: colors.neutralDark.lightest,
    },
    navCircle: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1, borderColor: colors.neutralLight.medium,
        backgroundColor: colors.neutralLight.lightest,
        justifyContent: 'center', alignItems: 'center',
    },
    navCircleJudged: {
        backgroundColor: colors.success.light,
        borderColor: colors.success.light,
    },
    navCircleWaiting: {
        backgroundColor: colors.error.light,
        borderColor: colors.error.medium,
    },
    navCircleSelected: {
        backgroundColor: colors.neutralLight.lightest,
        borderColor: colors.highlight.darkest,
        borderWidth: 2,
    },
    navCircleText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutralDark.lightest,
    },
    navCircleTextJudged: {
        color: colors.success.dark,
    },
    navCircleTextWaiting: {
        color: colors.error.dark,
        fontWeight: '800',
    },
    navCircleTextSelected: {
        color: colors.highlight.darkest,
        fontWeight: '800',
    },
    roundStatusWaiting: {
        width: 92,
        textAlign: 'right',
        fontSize: 11,
        color: colors.error.dark,
    },
    roundStatusNeutral: {
        width: 92,
        textAlign: 'right',
        fontSize: 11,
        color: colors.neutralDark.lightest,
    },
    navLegend: {
        gap: 16,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.neutralLight.light,
    },
    legendDot: {
        width: 6, height: 6, borderRadius: 3,
    },
    legendText: {
        fontSize: 11,
        color: colors.neutralDark.lightest,
    },
    acceptedCard: {
        backgroundColor: colors.neutralLight.lightest,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        padding: 16,
        gap: 20,
    },
    acceptedLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: colors.success.dark,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutralLight.medium,
        overflow: 'hidden',
    },
    progressFill: {
        height: 8,
        backgroundColor: colors.highlight.darkest,
    },
    groupCard: {
        backgroundColor: colors.neutralLight.lightest,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        padding: 18,
    },
    groupCardAccepted: {
        borderColor: colors.highlight.darkest,
        borderWidth: 2,
    },
    groupCardJudged: {
        opacity: 0.72,
    },
    groupNumber: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.neutralLight.light,
        borderWidth: 1, borderColor: colors.neutralLight.medium,
        justifyContent: 'center', alignItems: 'center',
    },
    groupNumberActive: {
        backgroundColor: colors.highlight.darkest,
        borderColor: colors.highlight.darkest,
    },
    groupReject: {
        width: 56, height: 48, borderRadius: 12,
        borderWidth: 2, borderColor: colors.error.medium,
        backgroundColor: colors.neutralLight.lightest,
        justifyContent: 'center', alignItems: 'center',
    },
    groupRejectActive: {
        backgroundColor: colors.error.medium,
    },
    groupAccept: {
        minWidth: 150, height: 48, borderRadius: 12,
        borderWidth: 2, borderColor: colors.success.medium,
        backgroundColor: colors.neutralLight.lightest,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingHorizontal: 16,
    },
    groupAcceptActive: {
        backgroundColor: colors.success.medium,
        borderColor: colors.success.medium,
    },
    teamPill: {
        backgroundColor: colors.neutralLight.light,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    lateSection: {
        backgroundColor: colors.neutralLight.lightest,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.warning.medium,
        padding: 16,
    },
    lateSectionLink: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.highlight.darkest,
    },
    lateRow: {
        backgroundColor: colors.neutralLight.light,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 14,
        gap: 14,
    },
    lateActionCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.neutralLight.medium,
        justifyContent: 'center', alignItems: 'center'
    },
    actionCircleCorrect: { backgroundColor: colors.success.medium },
    actionCircleWrong: { backgroundColor: colors.error.medium },
    badge: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1
    },
    badgeText: {
        fontSize: 14, fontWeight: 'bold'
    },
    badgeBlue: {
        backgroundColor: colors.highlight.lightest, borderColor: colors.highlight.light
    },
    badgeTextBlue: {
        color: colors.highlight.darkest
    },
    badgeGreen: {
        backgroundColor: colors.success.light, borderColor: colors.success.medium
    },
    badgeTextGreen: {
        color: colors.success.dark
    },
    badgeRed: {
        backgroundColor: colors.error.light, borderColor: colors.error.medium
    },
    badgeTextRed: {
        color: colors.error.dark
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    tagGreen: { backgroundColor: colors.success.light },
    tagTextGreen: { color: colors.success.dark },
    tagOrange: { backgroundColor: colors.warning.light },
    tagTextOrange: { color: colors.warning.dark },
    tagRed: { backgroundColor: colors.error.light },
    tagTextRed: { color: colors.error.dark },
});
