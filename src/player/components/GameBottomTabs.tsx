import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

export type TabType = 'play' | 'history' | 'results';

interface GameBottomTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const GameBottomTabs = ({ activeTab, onTabChange }: GameBottomTabsProps) => {
    return (
        <Box
            row
            style={{
                borderTopWidth: 1,
                borderColor: colors.neutralLight.medium,
                backgroundColor: colors.neutralLight.lightest,
                paddingBottom: Platform.OS === 'ios' ? 20 : 0 // Отступ для полоски на новых iPhone
            }}
        >
            <TabButton
                title="Игра"
                icon="play-circle"
                isActive={activeTab === 'play'}
                onPress={() => onTabChange('play')}
            />
            <TabButton
                title="История"
                icon="clock"
                isActive={activeTab === 'history'}
                onPress={() => onTabChange('history')}
            />
            <TabButton
                title="Результаты"
                icon="bar-chart-2"
                isActive={activeTab === 'results'}
                onPress={() => onTabChange('results')}
            />
        </Box>
    );
};

const TabButton = ({ title, icon, isActive, onPress }: any) => (
    <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Box
            align="center"
            p={3}
            gap={1}
            style={{
                borderTopWidth: 2,
                borderColor: isActive ? colors.highlight.darkest : 'transparent'
            }}
        >
            <Feather
                name={icon}
                size={20}
                color={isActive ? colors.highlight.darkest : colors.neutralDark.light}
            />
            <Text
                variant="bodyS"
                style={{
                    color: isActive ? colors.highlight.darkest : colors.neutralDark.medium,
                    fontWeight: isActive ? '600' : 'normal'
                }}
            >
                {title}
            </Text>
        </Box>
    </TouchableOpacity>
);