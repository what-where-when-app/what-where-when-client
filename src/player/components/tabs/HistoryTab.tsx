import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

export interface AnswerHistoryItem {
    questionNumber: number;
    answerText: string;
}

interface HistoryTabProps {
    history: AnswerHistoryItem[];
}

export const HistoryTab = ({ history }: HistoryTabProps) => {
    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Box gap={4} mb={6}>
                <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                    История ответов
                </Text>
                <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                    Ваши отправленные ответы
                </Text>
            </Box>

            {history.length === 0 ? (
                <Box align="center" justify="center" style={styles.emptyBox}>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                        Ваша команда еще не отправила ни одного ответа
                    </Text>
                </Box>
            ) : (
                <Box gap={3}>
                    {/* Переворачиваем массив, чтобы последние ответы были сверху */}
                    {[...history].reverse().map((item, index) => (
                        <Box key={index} style={styles.card}>
                            <Text variant="captionM" style={styles.questionLabel}>
                                ВОПРОС {item.questionNumber}
                            </Text>
                            <Text variant="bodyL" style={styles.answerText}>
                                {item.answerText}
                            </Text>
                        </Box>
                    ))}
                </Box>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    emptyBox: {
        marginTop: 40,
        padding: 32,
        backgroundColor: colors.neutralLight.light,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderStyle: 'dashed'
    },
    card: {
        backgroundColor: colors.neutralLight.lightest,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: 12,
        padding: 16,
    },
    questionLabel: {
        color: colors.neutralDark.medium,
        marginBottom: 8,
        letterSpacing: 1,
    },
    answerText: {
        color: colors.neutralDark.darkest,
        fontWeight: '500',
    }
});