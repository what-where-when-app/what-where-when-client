import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { TimerBar } from '@/src/ui/TimerBar';

interface MiniGameWidgetProps {
    phaseText: string;
    timeLeft: number;
    totalTime: number;
    onPress: () => void;
}

export const MiniGameWidget = ({ phaseText, timeLeft, totalTime, onPress }: MiniGameWidgetProps) => {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <Box style={styles.container}>
                <Box row justify="space-between" align="center" mb={2} px={4} pt={3}>
                    <Box row align="center" gap={2}>
                        <Box style={styles.iconWrapper}>
                            <Feather name="zap" size={14} color={colors.highlight.darkest} />
                        </Box>
                        <Text variant="bodyM" style={{ fontWeight: '600', color: colors.neutralDark.darkest }}>
                            {phaseText}
                        </Text>
                    </Box>
                    <Text variant="h4" style={{ color: timeLeft <= 10 ? colors.error.dark : colors.neutralDark.darkest }}>
                        {timeLeft} сек
                    </Text>
                </Box>

                {/* Наша анимированная полоска без отступов, прямо по нижнему краю виджета */}
                <TimerBar timeLeft={timeLeft} totalTime={totalTime} height={4} />
            </Box>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.highlight.lightest,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.highlight.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 4,
    },
    iconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }
});