import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { checkGameByCode } from '@/src/api/player';
import { colors } from '@/src/theme/colors';
import { metrics } from '@/src/theme/metrics';

type InputRef = TextInput | null;

export default function JoinScreen() {
    const [digits, setDigits] = useState<string[]>(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const inputRefs = useRef<InputRef[]>([]);

    const handleJoin = async () => {
        const code = digits.join('');
        if (code.length < 4) return;

        setLoading(true);
        Keyboard.dismiss();

        try {
            const gameData = await checkGameByCode(code);
            router.push({
                pathname: '/(player)/select-team',
                params: { gameData: JSON.stringify(gameData) }
            });
        } catch (e: any) {
            Alert.alert('Ошибка', e.message || 'Игра не найдена');
            setDigits(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleChangeText = (text: string, index: number) => {
        if (text.length > 1) {
            const newDigits = text.slice(0, 4).split('');
            setDigits(newDigits);
            if (newDigits.length === 4) {
                inputRefs.current[3]?.focus();
                Keyboard.dismiss();
            }
            return;
        }

        const newDigits = [...digits];
        newDigits[index] = text;
        setDigits(newDigits);

        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        if (index === 3 && text) {
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                setDigits(newDigits);
            }
        }
    };

    return (
        <Box style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Box style={styles.content}>

                    <Box style={styles.headerSpacer}>
                        <Text variant="h3">Enter game code</Text>
                        <Text variant="bodyS">Ask it from organisation</Text>
                    </Box>

                    <Box style={styles.otpContainer}>
                        {digits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(text) => handleChangeText(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={4}
                                selectTextOnFocus
                                caretHidden={false}
                            />
                        ))}
                    </Box>

                    <Box style={{ flex: 1 }} />

                    <Box style={styles.buttonContainer}>
                        <Button
                            title={loading ? "Поиск..." : "Далее"}
                            onPress={handleJoin}
                            disabled={loading || digits.join('').length < 4}
                            variant="primary"
                            size="md"
                        />
                    </Box>

                </Box>
            </KeyboardAvoidingView>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutralLight.lightest,
        alignContent: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        gap: 40
    },
    backButton: {
        marginTop: Platform.OS === 'android' ? 24 : 0,
        marginBottom: 24,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerSpacer: {
        alignItems: 'center',
        gap: 8
    },
    hintText: {
        color: colors.neutralDark.light,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    otpInput: {
        width: 48,
        height: 48,
        borderRadius: metrics.radius.md,
        borderWidth: 2,
        borderColor: colors.neutralLight.dark,
        backgroundColor: colors.neutralLight.lightest,
        textAlign: 'center',
        color: colors.neutralDark.darkest,
    },
    otpInputFilled: {
        borderColor: colors.highlight.darkest,
        backgroundColor: colors.neutralLight.lightest,
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        paddingBottom: Platform.OS === 'android' ? 12 : 0,
    }
});