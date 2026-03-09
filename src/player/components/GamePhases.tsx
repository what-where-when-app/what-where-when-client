import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { TextField } from '@/src/ui/TextField';
import { colors } from '@/src/theme/colors';

export const GameLobby = () => (
    <Box style={{ alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.neutralDark.dark} />
        <Text variant="bodyL" style={{ marginTop: 16, textAlign: 'center' }}>
            Ожидание начала игры ведущим...
        </Text>
    </Box>
);

export const ThinkingPhase = ({ timer }: { timer: number }) => (
    <Box style={{ alignItems: 'center' }}>
        <Text variant="h1" style={{ fontSize: 100, lineHeight: 110, color: timer <= 10 ? colors.highlight.dark : colors.neutralDark.lightest }}>
            {timer}
        </Text>
        <Text variant="bodyM" style={{ marginTop: 8, color: colors.highlight.dark }}>
            Время на обсуждение
        </Text>
    </Box>
);

export const AnsweringPhase = ({ onSubmit }: { onSubmit: (answer: string) => void }) => {
    const [answer, setAnswer] = useState('');

    return (
        <Box style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text variant="h5" style={{ textAlign: 'center', marginBottom: 24 }}>
                Время отвечать!
            </Text>

            <TextField
                placeholder="Ваш ответ"
                value={answer}
                onChangeText={setAnswer}
                style={{ marginBottom: 16 }}
            />

            <Button
                title="Отправить ответ"
                onPress={() => onSubmit(answer)}
                variant="primary"
                size="md"
                disabled={!answer.trim()}
            />
        </Box>
    );
};