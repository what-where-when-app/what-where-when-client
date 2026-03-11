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
        // flex={1} — на весь экран
        // bg="neutralLight.lightest" — цвет фона из темы
        // justify="center" — центрируем контент по вертикали
        // p={6} — отступ 24px (согласно metrics.space[6])
        <Box flex={1} bg="neutralLight.lightest" justify="center" p={6}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Центральная карточка: ограничиваем ширину для десктопа */}
            <Box
                width="100%"
                maxWidth={450}
                align="stretch"
                style={{ alignSelf: 'center' }}
                gap={8} // промежуток 32px между заголовком, кнопками и футером
            >
                <Feather name="smile" size={64} color="black" />

                {/* Хедер */}
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

                {/* Группа кнопок */}
                <Box gap={6}>
                    {/* Секция Игрока */}
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

                    {/* Секция Хоста */}
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

                {/* Футер с разделителем */}
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