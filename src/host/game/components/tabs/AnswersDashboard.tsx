import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { AnswerDomain } from "@/src/dto/game.dto";
import { AnswerStatus } from "@/src/dto/common.dto";
import { mixpanel } from "@/src/analytics/mixpanel";
import { normalizeAnswerText, levenshteinDistance } from "@/src/util/textSimilarity";

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
    maxLateBySeconds: number | null;
}

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

    const acceptedNormalized = useMemo(
        () => activeQuestion?.answer ? normalizeAnswerText(activeQuestion.answer) : '',
        [activeQuestion?.answer]
    );

    const groups = useMemo<AnswerGroup[]>(() => {
        const byKey = new Map<string, AnswerDomain[]>();
        currentAnswers.forEach(ans => {
            const normalized = normalizeAnswerText(ans.answerText);
            const key = normalized === '' ? `__single_${ans.id}` : normalized;
            const existing = byKey.get(key);
            if (existing) existing.push(ans);
            else byKey.set(key, [ans]);
        });

        const result: AnswerGroup[] = Array.from(byKey.values()).map(members => {
            const normalized = normalizeAnswerText(members[0].answerText);
            const allCorrect = members.every(m => m.status === AnswerStatus.CORRECT);
            const allIncorrect = members.every(m => m.status === AnswerStatus.INCORRECT);
            const allUnset = members.every(m => m.status === AnswerStatus.UNSET);
            const status: AnswerGroup['status'] =
                allUnset ? 'unset' : allCorrect ? 'correct' : allIncorrect ? 'incorrect' : 'mixed';
            const matchesAccepted = acceptedNormalized !== '' && normalized === acceptedNormalized;

            let charactersOff: number | null = null;
            if (!matchesAccepted && acceptedNormalized !== '' && normalized !== '') {
                const distance = levenshteinDistance(normalized, acceptedNormalized);
                if (distance > 0 && distance <= 2) charactersOff = distance;
            }

            const maxLateBySeconds = members.reduce<number | null>((max, m) => {
                if (m.lateBySeconds == null) return max;
                return max == null ? m.lateBySeconds : Math.max(max, m.lateBySeconds);
            }, null);

            return {
                key: `${members[0].questionId}-${normalized || members[0].id}`,
                displayText: members[0].answerText,
                answers: members,
                status,
                matchesAccepted,
                charactersOff,
                maxLateBySeconds,
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
    }, [currentAnswers, acceptedNormalized]);

    const judgeGroup = (group: AnswerGroup, verdict: AnswerStatus) => {
        const ids = group.answers.map(a => a.id);
        void mixpanel.track("Host Answer Group Judged", {
            question_id: selectedQId,
            group_size: ids.length,
            matches_accepted: group.matchesAccepted,
            verdict,
        });
        if (onJudgeBulk) {
            onJudgeBulk(ids, verdict);
        } else {
            ids.forEach(id => onJudge(id, verdict));
        }
    };

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ margin: 10 }} showsVerticalScrollIndicator={false}>

                <Box style={styles.topCard}>
                    <Box row style={{ gap: 32 }}>
                        <Box style={{ flex: 1 }}>
                            <Box style={{ gap: 8 }}>
                                {rounds.map((round) => (
                                    <Box key={round.id || round._tmpId} style={{ gap: 4 }}>
                                        <Text variant="captionM" style={{ color: colors.neutralDark.medium, fontWeight: 'bold' }}>
                                            {round.name || t("hostAnswersDashboard.roundFallback", { n: round.round_number })}
                                        </Text>

                                        <Box row style={{ flexWrap: 'wrap', gap: 12 }}>
                                            {(round.questions || []).map((q: any) => {
                                                const isSelected = q.id === selectedQId;
                                                const outlineColor = isSelected ? colors.highlight.darkest : colors.neutralLight.dark;

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
                                                            styles.qCircle,
                                                            { borderColor: outlineColor },
                                                            isSelected && { borderWidth: 2 }
                                                        ]}
                                                    >
                                                        <Text style={{
                                                            fontWeight: isSelected ? 'bold' : 'normal',
                                                            color: isSelected ? colors.highlight.darkest : colors.neutralDark.darkest
                                                        }}>
                                                            {q.question_number}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box style={{ flex: 1 }}>
                            <Text variant="bodyM" style={{ color: colors.neutralDark.medium, lineHeight: 24, marginBottom: 16 }}>
                                {activeQuestion?.text || t("hostAnswersDashboard.selectQuestion")}
                            </Text>
                            <Text variant="h3">{activeQuestion?.answer}</Text>
                        </Box>
                    </Box>
                </Box>

                <Box row align="center" style={{ marginBottom: 10, gap: 16, flexWrap: 'wrap' }}>
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
                    {groups.length === 0 ? (
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center', padding: 20 }}>
                            {t("hostAnswersDashboard.empty")}
                        </Text>
                    ) : (
                        groups.map(group => {
                            const isCorrect = group.status === 'correct';
                            const isWrong = group.status === 'incorrect';

                            return (
                                <Box
                                    key={group.key}
                                    style={[
                                        styles.groupCard,
                                        group.matchesAccepted && styles.groupCardAccepted,
                                        (isCorrect || isWrong) && styles.groupCardJudged,
                                    ]}
                                >
                                    <Box row align="center" justify="space-between" style={{ gap: 20 }}>
                                        <Box style={{ flex: 1, gap: 8 }}>
                                            <Box row align="center" style={{ gap: 10, flexWrap: 'wrap' }}>
                                                <Text variant="h3" style={{ color: colors.neutralDark.darkest }}>
                                                    {group.displayText || t("hostAnswersDashboard.noAnswerText")}
                                                </Text>

                                                {group.matchesAccepted && (
                                                    <Box style={[styles.badge, styles.badgeGreen]}>
                                                        <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                                                            {t("hostAnswersDashboard.matchesAccepted")}
                                                        </Text>
                                                    </Box>
                                                )}

                                                {group.charactersOff != null && (
                                                    <Box style={[styles.badge, styles.badgeOrange]}>
                                                        <Text style={[styles.badgeText, styles.badgeTextOrange]}>
                                                            {t("hostAnswersDashboard.charactersOff", { count: group.charactersOff })}
                                                        </Text>
                                                    </Box>
                                                )}

                                                {group.maxLateBySeconds ? (
                                                    <Box style={[styles.badge, styles.badgeRed]}>
                                                        <Text style={[styles.badgeText, styles.badgeTextRed]}>
                                                            {t("hostAnswersDashboard.lateBy", { seconds: group.maxLateBySeconds })}
                                                        </Text>
                                                    </Box>
                                                ) : null}
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

                                        <Box row align="center" style={[
                                            styles.actionPill,
                                            isCorrect && styles.pillCorrect,
                                            isWrong && styles.pillWrong
                                        ]}>
                                            <TouchableOpacity
                                                style={[styles.actionCircle, isWrong && styles.actionCircleWrong]}
                                                onPress={() => judgeGroup(group, AnswerStatus.INCORRECT)}
                                            >
                                                <Feather name="x" size={20} color={isWrong ? '#fff' : colors.neutralDark.medium} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionCircle, isCorrect && styles.actionCircleCorrect]}
                                                onPress={() => judgeGroup(group, AnswerStatus.CORRECT)}
                                            >
                                                <Feather name="check" size={20} color={isCorrect ? '#fff' : colors.neutralDark.medium} />
                                            </TouchableOpacity>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })
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
    topCard: {
        backgroundColor: colors.neutralLight.lightest,
        padding: 24,
        marginBottom: 10,
        borderRadius: 16,
    },
    qCircle: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: colors.neutralLight.lightest
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
    teamPill: {
        backgroundColor: colors.neutralLight.light,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    actionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32,
        paddingVertical: 6,
        paddingHorizontal: 16,
        gap: 24,
    },
    pillCorrect: { backgroundColor: colors.success.light },
    pillWrong: { backgroundColor: colors.error.light },
    actionCircle: {
        width: 40, height: 40, borderRadius: 20,
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
    badgeOrange: {
        backgroundColor: colors.warning.light, borderColor: colors.warning.medium
    },
    badgeTextOrange: {
        color: colors.warning.dark
    }
});