import { Stack } from 'expo-router';

export default function PlayerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="join" options={{ headerShown: false }} />
            <Stack.Screen name="select-team" options={{ title: 'Выбор команды', headerShown: false }} />
            <Stack.Screen name="game" options={{ gestureEnabled: false }} />
        </Stack>
    );
}