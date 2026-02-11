import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Link, Stack, useRouter} from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import {Text} from "@/src/ui/Text";

export default function Index() {
    const router = useRouter();

    return (
        <Box style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Button
                title="Join game"
                variant="primary"
                onPress={() => router.push('/(player)/join')}
            />

            <Button
                title="Return to existing game"
                variant="secondary"
            />

            <View style={{ alignItems: "center" }}>
                <Text variant="bodyS" style={{ color: colors.neutralDark.light }}>
                    or
                </Text>
            </View>

            <Button
                title="Give feedback"
                variant="secondary"
            />
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        backgroundColor: colors.neutralLight.lightest,
    },
});