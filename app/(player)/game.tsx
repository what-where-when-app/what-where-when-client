import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

// Импортируем наши новые UI-компоненты
import { GameHeader } from './components/GameHeader';
import { GameBottomTabs, TabType } from './components/GameBottomTabs';
import { MiniGameWidget } from './components/MiniGameWidget';

import { PlayTab } from './components/tabs/PlayTab';

// Хук сокетов и типы
import { usePlayerGame } from './hooks/usePlayerGame';
import { GamePhase } from '@/src/dto/common.dto';

export default function GameScreen() {
    const { gameId, teamId, teamName } = useLocalSearchParams();

    // Стейт для управления текущей открытой вкладкой
    const [activeTab, setActiveTab] = useState<TabType>('play');

    // Наш хук сокетов работает на верхнем уровне, поэтому он НИКОГДА
    // не прерывается при переключении вкладок
    const { status, gameStarted, phase, timer, submitAnswer } = usePlayerGame(
        gameId as string,
        teamId as string,
        teamName as string
    );

    const [phaseTotalTime, setPhaseTotalTime] = useState(timer > 0 ? timer : 1);
    const [prevPhase, setPrevPhase] = useState(phase);

    React.useEffect(() => {
        // Если фаза сменилась, сбрасываем общее время на текущий таймер
        if (phase !== prevPhase) {
            setPrevPhase(phase);
            setPhaseTotalTime(timer > 0 ? timer : 1);
        }
        // Если таймер вдруг стал больше (например, админ накинул время)
        else if (timer > phaseTotalTime) {
            setPhaseTotalTime(timer);
        }
    }, [phase, timer, prevPhase, phaseTotalTime]);

    // Функция, которая подставляет нужный контент в центр экрана
    const renderContent = () => {
        // Если игра еще не началась, показываем лобби поверх всего
        if (!gameStarted) {
            return (
                <Box flex={1} justify="center" align="center" p={4}>
                    <Text variant="h2" style={{ textAlign: 'center', marginBottom: 16 }}>
                        Ожидаем начала игры...
                    </Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                        Статус подключения: {status}
                    </Text>
                </Box>
            );
        }

        switch (activeTab) {
            case 'play':
                return (
                    <PlayTab
                        phase={phase}
                        timer={timer}
                        totalTime={phaseTotalTime}
                        submitAnswer={submitAnswer}
                    />
                );
            case 'history':
                // ЗДЕСЬ БУДЕТ HistoryTab.tsx
                return (
                    <Box flex={1} justify="center" align="center">
                        <Text variant="h2">История</Text>
                    </Box>
                );
            case 'results':
                // ЗДЕСЬ БУДЕТ ResultsTab.tsx
                return (
                    <Box flex={1} justify="center" align="center">
                        <Text variant="h2">Результаты</Text>
                    </Box>
                );
            default:
                return null;
        }
    };

    // Определяем, нужно ли показывать свернутый виджет.
    // Показываем его ТОЛЬКО если игра идет, мы не на главной вкладке, и фаза не IDLE.
    const shouldShowMiniWidget = gameStarted && activeTab !== 'play' && phase !== GamePhase.IDLE;

    // Определяем текст для мини-виджета в зависимости от фазы
    const getPhaseText = () => {
        if (phase === GamePhase.THINKING) return 'Время на обсуждение';
        if (phase === GamePhase.ANSWERING) return 'Время для ответа';
        return 'Ожидание...';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <Box flex={1} align="center">
                <Box maxWidth={450} width="100%" flex={1} justify="space-between">

                    {/* 1. ХЕДЕР */}
                    <GameHeader
                        teamName={teamName as string}
                        // Временно захардкодим, потом эти данные придут из хука
                        gameName="ЧГК: Осенняя серия"
                        roundInfo="Раунд 1 • Вопрос 5"
                    />

                    {/* 2. ЦЕНТРАЛЬНЫЙ КОНТЕНТ (Меняется по клику на табы) */}
                    <Box flex={1} style={{ width: '100%' }}>
                        {renderContent()}
                    </Box>

                    {/* 3. МИНИ-ВИДЖЕТ (Появляется над табами при уходе с вкладки "Игра") */}
                    {shouldShowMiniWidget && (
                        <MiniGameWidget
                            phaseText={getPhaseText()}
                            timeLeft={timer}
                            totalTime={phaseTotalTime}
                            // По клику на виджет мгновенно возвращаем игрока на вкладку 'play'
                            onPress={() => setActiveTab('play')}
                        />
                    )}

                    {/* 4. НИЖНЯЯ НАВИГАЦИЯ */}
                    {/* Показываем меню только если игра уже началась */}
                    {gameStarted && (
                        <GameBottomTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    )}

                </Box>
            </Box>
        </SafeAreaView>
    );
}