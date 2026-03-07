import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

// Импортируем наши новые UI-компоненты
import { GameHeader } from '../../src/player/components/GameHeader';
import { GameBottomTabs, TabType } from '../../src/player/components/GameBottomTabs';
import { MiniGameWidget } from '../../src/player/components/MiniGameWidget';

import { PlayTab } from '@/src/player/components/tabs/PlayTab';

// Хук сокетов и типы
import { usePlayerGame } from '@/src/player/hooks/usePlayerGame';
import { GamePhase } from '@/src/dto/common.dto';
import {Keyboard, KeyboardAvoidingView, Platform} from "react-native";

export default function GameScreen() {
    const { gameId, teamId, teamName } = useLocalSearchParams();

    // Стейт для управления текущей открытой вкладкой
    const [activeTab, setActiveTab] = useState<TabType>('play');

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    React.useEffect(() => {
        // Слушаем события открытия/закрытия клавиатуры
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const {
        status,
        gameStarted,
        phase,
        timer,
        activeQuestionNumber,
        lastAnswerStatus,
        submitAnswer
    } = usePlayerGame(
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
        switch (activeTab) {
            case 'play':
                return (
                    <PlayTab
                        phase={phase}
                        timer={timer}
                        totalTime={phaseTotalTime}
                        questionNumber={activeQuestionNumber}
                        gameStarted={gameStarted}
                        submitAnswer={submitAnswer}
                        lastAnswerStatus={lastAnswerStatus}
                    />
                );
            case 'history':
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
    const shouldShowMiniWidget = gameStarted && activeTab !== 'play' &&
        (phase === GamePhase.THINKING || phase === GamePhase.ANSWERING);

    // Определяем текст для мини-виджета в зависимости от фазы
    const getPhaseText = () => {
        if (phase === GamePhase.THINKING) return 'Время на обсуждение';
        if (phase === GamePhase.ANSWERING) return 'Время для ответа';
        if (phase === GamePhase.PREPARATION) return 'Внимание, вопрос...';
        return 'Ожидание...';
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            {/* ПЕРЕНЕСЛИ KEYBOARD AVOIDING VIEW СЮДА */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled={Platform.OS !== 'web'}
                style={{ flex: 1 }}
            >
                <Box flex={1} align="center">
                    <Box maxWidth={450} width="100%" flex={1} justify="space-between">

                        <GameHeader
                            teamName={teamName as string}
                            gameName="ЧГК: Осенняя серия"
                            roundInfo="Раунд 1 • Вопрос 5"
                        />

                        <Box flex={1} style={{ width: '100%' }}>
                            {renderContent()}
                        </Box>

                        {shouldShowMiniWidget && (
                            <MiniGameWidget
                                phaseText={getPhaseText()}
                                timeLeft={timer}
                                totalTime={phaseTotalTime}
                                onPress={() => setActiveTab('play')}
                            />
                        )}

                        {/* СКРЫВАЕМ ТАБЫ, ЕСЛИ ОТКРЫТА КЛАВИАТУРА (!isKeyboardVisible) */}
                        {gameStarted && !isKeyboardVisible && (
                            <GameBottomTabs
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        )}

                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}