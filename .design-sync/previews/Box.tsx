import React from "react";
import { View } from "react-native";
import { Box } from "whatwherewhen-ds/src/ui/Box";
import { Text } from "whatwherewhen-ds/src/ui/Text";

export function Padding() {
    return (
        <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <Box bg="highlight.darkest" p={1} radius="sm">
                <Box bg="highlight.lightest" width={40} height={40} />
            </Box>
            <Box bg="highlight.darkest" p={3} radius="sm">
                <Box bg="highlight.lightest" width={40} height={40} />
            </Box>
            <Box bg="highlight.darkest" p={6} radius="sm">
                <Box bg="highlight.lightest" width={40} height={40} />
            </Box>
        </View>
    );
}

export function Row() {
    return (
        <Box row gap={3} bg="neutralLight.light" p={4} radius="md">
            <Box bg="highlight.darkest" width={48} height={48} radius="sm" />
            <Box bg="success.medium" width={48} height={48} radius="sm" />
            <Box bg="warning.medium" width={48} height={48} radius="sm" />
            <Box bg="error.medium" width={48} height={48} radius="sm" />
        </Box>
    );
}

export function Colors() {
    return (
        <View style={{ flexDirection: "row", gap: 12 }}>
            <Box bg="highlight.darkest" width={64} height={64} radius="md" align="center" justify="center">
                <Text variant="captionM" style={{ color: "#FFFFFF" }}>
                    brand
                </Text>
            </Box>
            <Box bg="success.medium" width={64} height={64} radius="md" />
            <Box bg="warning.medium" width={64} height={64} radius="md" />
            <Box bg="error.medium" width={64} height={64} radius="md" />
            <Box bg="neutralLight.medium" width={64} height={64} radius="md" />
        </View>
    );
}

export function Composition() {
    return (
        <Box bg="neutralLight.lightest" p={4} radius="lg" width={280} style={{ borderWidth: 1, borderColor: "#E8E9F1" }}>
            <Text variant="h5">Trivia Night</Text>
            <Box mt={2}>
                <Text variant="bodyS" style={{ color: "#71727A" }}>
                    Fridays at 8:00 PM · 5 rounds
                </Text>
            </Box>
        </Box>
    );
}
