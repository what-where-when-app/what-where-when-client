import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { Tag } from '@/src/ui/Tag';
import { colors } from '@/src/theme/colors';
import {AnswerDomain} from "@/src/dto/game.dto";
import {AnswerStatus} from "@/src/dto/common.dto";

interface Props {
    rounds: any[];
    answers: AnswerDomain[];
    onJudge: (id: number, verdict: AnswerStatus) => void;
}

export const AnswersDashboard = ({ rounds, answers, onJudge }: Props) => {
    const allQuestions = useMemo(() => rounds.flatMap(r => r.questions), [rounds]);
    const [selectedQId, setSelectedQId] = useState<number | null>(allQuestions[0]?.id || null);

    const currentAnswers = useMemo(() =>
            answers.filter(a => a.questionId === selectedQId),
        [answers, selectedQId]);

    return (
        <Box style={styles.container}>
            {/* Вкладки вопросов */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                {allQuestions.map(q => (
                    <TouchableOpacity
                        key={q.id}
                        onPress={() => setSelectedQId(q.id)}
                        style={[styles.tab, selectedQId === q.id && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, selectedQId === q.id && styles.tabTextActive]}>
                            Q{q.question_number}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Сетка ответов */}
            <Box style={styles.content}>
                {currentAnswers.length === 0 ? (
                    <Text variant="bodyM" style={styles.empty}>Нет ответов для этого вопроса</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {currentAnswers.map(ans => (
                            <Box key={ans.id} style={[
                                styles.card,
                                ans.status === AnswerStatus.CORRECT && styles.cardCorrect,
                                ans.status === AnswerStatus.INCORRECT && styles.cardWrong
                            ]}>
                                <Box style={styles.cardHeader}>
                                    <Text variant="captionM" style={styles.teamName}>{ans.teamName}</Text>
                                    <Tag
                                        text={ans.status}
                                    />
                                </Box>

                                <Text variant="bodyL" style={styles.answerText}>{ans.answerText}</Text>

                                <Box style={styles.actions}>
                                    <Button
                                        title="Correct"
                                        variant="primary"
                                        onPress={() => onJudge(ans.id, AnswerStatus.CORRECT)}
                                    />
                                    <Button
                                        title="Wrong"
                                        variant="secondary"
                                        onPress={() => onJudge(ans.id, AnswerStatus.INCORRECT)}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </ScrollView>
                )}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: colors.neutralLight.lightest, borderBottomWidth: 1, borderColor: colors.neutralLight.medium },
    tabs: { padding: 12, borderBottomWidth: 1, borderColor: colors.neutralLight.light },
    tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: colors.neutralLight.light },
    tabActive: { backgroundColor: colors.neutralLight.dark },
    tabText: { fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    content: { padding: 16, minHeight: 160 },
    card: {
        width: 240, padding: 16, borderRadius: 12, marginRight: 12,
        backgroundColor: '#fff', borderWidth: 1, borderColor: colors.neutralLight.medium
    },
    cardCorrect: { borderColor: colors.success.medium, backgroundColor: colors.success.light },
    cardWrong: { borderColor: colors.error.dark, backgroundColor: colors.error.light },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    teamName: { fontWeight: 'bold' },
    answerText: { marginBottom: 16, fontSize: 18, fontWeight: '500' },
    actions: { flexDirection: 'row', gap: 8 },
    empty: { textAlign: 'center', color: colors.neutralDark.light, marginTop: 20 }
});