import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { HostNotification } from '@/src/host/game/hooks/useHostGame';

interface HostNotificationsProps {
    notifications: HostNotification[];
    onDismiss: (id: string) => void;
}

export const HostNotifications = ({ notifications, onDismiss }: HostNotificationsProps) => {
    if (notifications.length === 0) return null;

    return (
        <Box style={styles.container} pointerEvents="box-none">
            {notifications.map(n => (
                <TouchableOpacity
                    key={n.id}
                    onPress={() => onDismiss(n.id)}
                    style={[styles.toast, n.type === 'error' ? styles.error : styles.info]}
                    activeOpacity={0.85}
                >
                    <Feather
                        name={n.type === 'error' ? 'alert-circle' : 'info'}
                        size={16}
                        color={n.type === 'error' ? colors.error.dark : colors.highlight.darkest}
                        style={{ marginRight: 8 }}
                    />
                    <Text
                        variant="bodyS"
                        style={{ color: colors.neutralDark.darkest, flex: 1 }}
                    >
                        {n.message}
                    </Text>
                </TouchableOpacity>
            ))}
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    error: {
        backgroundColor: colors.error.light,
    },
    info: {
        backgroundColor: colors.highlight.lightest,
    },
});
