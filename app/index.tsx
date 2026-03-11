import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Button } from '@/src/ui/Button';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import Feather from "@expo/vector-icons/Feather";

export default function Index() {
    const router = useRouter();

    return (
        <Box flex={1} bg="neutralLight.lightest" justify="center" p={6}>
            <Stack.Screen options={{ headerShown: false }} />

            <Box
                width="100%"
                maxWidth={450}
                align="stretch"
                style={{ alignSelf: 'center' }}
                gap={8}
            >
                <Box align="center">
                    <Text variant="h1" style={{ textAlign: 'center' }}>
                        Что? Где? Когда?
                    </Text>
                    <Text
                        variant="bodyM"
                        style={{
                            textAlign: 'center',
                            color: colors.neutralDark.light,
                            marginTop: 8
                        }}
                    >
                        Платформа для проведения турниров
                    </Text>
                </Box>

                <Box gap={6}>
                    <Box gap={3}>
                        <Text variant="h3" style={{ color: colors.neutralDark.medium }}>
                            Для команд
                        </Text>
                        <Button
                            title="Я игрок"
                            variant="primary"
                            onPress={() => router.push('/(player)/join')}
                        />
                    </Box>

                    <Box gap={3}>
                        <Text variant="h3" style={{ color: colors.neutralDark.medium }}>
                            Для организаторов
                        </Text>
                        <Button
                            title="Я хост"
                            variant="secondary"
                            onPress={() => router.push('/(host)/login')}
                        />
                    </Box>
                </Box>

                <Box
                    pt={6}
                    mt={3}
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: colors.neutralLight.medium
                    }}
                >
                    <Button
                        title="Дать обратную связь"
                        variant="tertiary"
                        onPress={() => router.push('/modal')}
                    />
                </Box>

            </Box>
        </Box>
    );
}