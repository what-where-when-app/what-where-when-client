import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { TimerBar } from '@/src/ui/TimerBar';
import { GamePhase } from '@/src/dto/common.dto';

interface PlayTabProps {
    phase: GamePhase;
    timer: number;
    totalTime: number;
    submitAnswer: (answer: string) => void;
    lastAnswerStatus?: 'success' | 'error' | null;
}

export const PlayTab = ({ phase, timer, totalTime, submitAnswer, lastAnswerStatus }: PlayTabProps) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (phase === GamePhase.IDLE) {
            setAnswer('');
            setIsSubmitting(false);
        }
    }, [phase]);

    const handleSend = () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        submitAnswer(answer.trim());
        Keyboard.dismiss();
        setTimeout(() => setIsSubmitting(false), 500);
    };

    const renderPhaseInfo = () => {
        if (phase === GamePhase.IDLE) {
            return (
                <Box align="center" gap={2} mb={4}>
                    <Text variant="h2" style={{ color: colors.neutralDark.medium }}>Ожидание...</Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                        Ведущий скоро запустит таймер
                    </Text>
                </Box>
            );
        }

        const title = phase === GamePhase.THINKING ? 'Время на обсуждение' : 'Время для ответа';
        const description = phase === GamePhase.THINKING
            ? 'Обсуждайте вопрос и вписывайте ответ'
            : 'Последний шанс отправить ответ!';

        return (
            <Box align="center" gap={2} mb={4}>
                <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>{title}</Text>
                <Text variant="bodyL" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>{description}</Text>
            </Box>
        );
    };
    // TODO fix TouchableWithoutFeedback
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Box width="100%" align="center" gap={6}>

                        {renderPhaseInfo()}

                        {phase !== GamePhase.IDLE && (
                            <Box width="100%" align="center" gap={4} mb={4}>
                                <Text
                                    variant="h1"
                                    style={{
                                        fontSize: 64,
                                        lineHeight: 72,
                                        color: timer <= 10 ? colors.error.dark : colors.neutralDark.darkest
                                    }}
                                >
                                    {timer}
                                </Text>
                                <TimerBar timeLeft={timer} totalTime={totalTime} height={12} />
                            </Box>
                        )}

                        {phase !== GamePhase.IDLE && (
                            <Box width="100%" gap={4}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Введите ваш ответ здесь..."
                                    placeholderTextColor={colors.neutralDark.light}
                                    value={answer}
                                    onChangeText={setAnswer}
                                    editable={!isSubmitting && timer > 0}
                                    multiline
                                    blurOnSubmit
                                />

                                <Button
                                    title={isSubmitting ? "Отправка..." : "Отправить ответ"}
                                    variant="primary"
                                    onPress={handleSend}
                                    disabled={!answer.trim() || isSubmitting || timer === 0}
                                />

                                {lastAnswerStatus === 'success' && (
                                    <Text variant="bodyM" style={{ color: colors.success.dark, textAlign: 'center' }}>
                                        Ответ принят!
                                    </Text>
                                )}
                            </Box>
                        )}

                    </Box>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    input: {
        width: '100%',
        minHeight: 120,
        backgroundColor: colors.neutralLight.lightest,
        borderWidth: 2,
        borderColor: colors.neutralLight.medium,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: colors.neutralDark.darkest,
        fontFamily: 'InterRegular',
        textAlignVertical: 'top',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    }
});