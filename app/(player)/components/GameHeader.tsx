import React from 'react';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

interface GameHeaderProps {
    teamName: string;
    gameName?: string;
    roundInfo?: string; // Например: "Раунд 1 • Вопрос 5"
}

export const GameHeader = ({ teamName, gameName, roundInfo }: GameHeaderProps) => {
    return (
        <Box p={4} pb={2} gap={1} style={{ borderBottomWidth: 1, borderColor: colors.neutralLight.medium }}>
            {/* Название команды - самое крупное */}
            <Text variant="h3" style={{ textAlign: 'center', color: colors.neutralDark.darkest }}>
                {teamName}
            </Text>

            {/* Дополнительная информация */}
            {gameName && (
                <Text variant="bodyS" style={{ textAlign: 'center', color: colors.highlight.darkest, fontWeight: 'bold' }}>
                    {gameName}
                </Text>
            )}
            {roundInfo && (
                <Text variant="bodyS" style={{ textAlign: 'center', color: colors.neutralDark.light }}>
                    {roundInfo}
                </Text>
            )}
        </Box>
    );
};