import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { PlayerNotification } from '@/src/player/hooks/usePlayerGame';

interface PlayerSnackbarProps {
    notifications: PlayerNotification[];
    onDismiss: (id: string) => void;
    bottomOffset?: number;
}

export const PlayerSnackbar = ({ notifications, onDismiss, bottomOffset = 24 }: PlayerSnackbarProps) => {
    const current = notifications[0] ?? null;
    const translateY = useRef(new Animated.Value(40)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!current) return;
        translateY.setValue(40);
        opacity.setValue(0);
        Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [current?.id]);

    if (!current) return null;

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[styles.container, { bottom: bottomOffset, transform: [{ translateY }], opacity }]}
        >
            <TouchableOpacity
                onPress={() => onDismiss(current.id)}
                activeOpacity={0.9}
                style={styles.snackbar}
            >
                <Feather
                    name={current.type === 'error' ? 'alert-circle' : 'info'}
                    size={16}
                    color={current.type === 'error' ? colors.error.medium : colors.highlight.medium}
                    style={{ marginRight: 8 }}
                />
                <Text variant="bodyS" style={{ color: colors.neutralLight.lightest, flex: 1 }}>
                    {current.message}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 100,
    },
    snackbar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: colors.neutralDark.darkest,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
});
