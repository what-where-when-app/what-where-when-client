import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

interface EditorSaveStatusProps {
    isSubmitting: boolean;
    saveError: string | null;
    onRetry: () => void;
}

// Floats above the layout instead of sitting inline, so a "Saving…" flash
// that lasts a fraction of a second never shifts the tabs/content around it.
export const EditorSaveStatus = ({ isSubmitting, saveError, onRetry }: EditorSaveStatusProps) => {
    const { t } = useTranslation();
    const visible = isSubmitting || Boolean(saveError);
    const isError = Boolean(saveError) && !isSubmitting;

    const translateY = useRef(new Animated.Value(20)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: visible ? 0 : 20, duration: 180, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 180, useNativeDriver: true }),
        ]).start();
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[styles.container, { transform: [{ translateY }], opacity }]}
        >
            <TouchableOpacity
                disabled={!isError}
                onPress={onRetry}
                activeOpacity={0.85}
                style={[styles.pill, isError ? styles.error : styles.saving]}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.neutralLight.lightest} style={{ marginRight: 6 }} />
                ) : (
                    <Feather name="alert-circle" size={14} color={colors.neutralLight.lightest} style={{ marginRight: 6 }} />
                )}
                <Text variant="bodyS" style={{ color: colors.neutralLight.lightest }}>
                    {isError ? t("hostEditor.saveStatusError") : t("hostEditor.saveStatusSaving")}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 24,
        alignItems: 'center',
        zIndex: 100,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 100,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.neutralDark.darkest,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    saving: {},
    error: {
        backgroundColor: colors.error.dark,
    },
});
