import React from "react";
import { View, Text as RNText } from "react-native";
import { ListItem } from "whatwherewhen-ds/src/ui/ListItem";

function Avatar({ color, initials }: { color: string; initials: string }) {
    return (
        <View
            style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <RNText style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>{initials}</RNText>
        </View>
    );
}

export function Default() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <ListItem
                title="Trivia Night: Movie Edition"
                description="Team of 4 · Starts 8:00 PM"
                left={<Avatar color="#6FBAFF" initials="TN" />}
                right={<RNText style={{ color: "#71727A", fontSize: 22, lineHeight: 22 }}>›</RNText>}
                onPress={() => {}}
            />
        </View>
    );
}

export function Highlight() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <ListItem
                variant="highlight"
                title="Your team is in 1st place!"
                description="12 points ahead of 2nd place"
                left={<Avatar color="#006FFD" initials="🏆" />}
                right={
                    <View
                        style={{
                            backgroundColor: "#EAF2FF",
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                        }}
                    >
                        <RNText style={{ color: "#006FFD", fontSize: 12, fontWeight: "700" }}>NEW</RNText>
                    </View>
                }
                onPress={() => {}}
            />
        </View>
    );
}

export function Empty() {
    return (
        <View style={{ gap: 12, width: 320 }}>
            <ListItem
                variant="empty"
                title="No games scheduled"
                description="Check back later for new trivia nights"
            />
        </View>
    );
}
