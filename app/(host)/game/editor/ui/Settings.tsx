import React from "react";
import {View} from "react-native";
import { Text } from "@/src/ui/Text";
import { NumberInput } from "@/src/ui/NumberInput";
import {SwitchListItem} from "@/src/ui/SwitchListItem";

export function SettingsSections({
                                     settings,
                                     onChange,
                                 }: {
    settings: any;
    onChange: (next: any) => void;
}) {
    return (
        <>
            <View style={{ paddingHorizontal: 16 }}>
                <Text variant="h3" style={{ paddingVertical: 20 }}>Time settings</Text>

                <View style={{ flexDirection: "row", gap: 100, paddingVertical: 20 }}>
                    <View style={{ flex: 1 }}>
                        <NumberInput
                            title="Time to think (sec)"
                            value={settings.time_to_think_sec}
                            min={0}
                            max={999}
                            onChange={(v) => onChange({ ...settings, time_to_think_sec: v })}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <NumberInput
                            title="Time to answer (sec)"
                            value={settings.time_to_answer_sec}
                            min={0}
                            max={999}
                            onChange={(v) => onChange({ ...settings, time_to_answer_sec: v })}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <NumberInput
                            title="Time to dispute in the end (min)"
                            value={settings.time_to_dispute_end_min}
                            min={0}
                            max={999}
                            onChange={(v) => onChange({ ...settings, time_to_dispute_end_min: v })}
                        />
                    </View>
                </View>
            </View>

            <View>
                <Text variant="h3" style={{ paddingHorizontal: 16, paddingVertical: 20 }}>Other settings</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 30, paddingVertical: 20 }}>
                    <View style={{ flex: 1 }}>
                        <SwitchListItem
                            title="Show leaderboard"
                            description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do"
                            value={settings.show_leaderboard}
                            onValueChange={(v) => onChange({ ...settings, show_leaderboard: v })}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <SwitchListItem
                            title="Show questions"
                            description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do"
                            value={settings.show_questions}
                            onValueChange={(v) => onChange({ ...settings, show_questions: v })}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <SwitchListItem
                            title="Show answers"
                            description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do"
                            value={settings.show_answers}
                            onValueChange={(v) => onChange({ ...settings, show_answers: v })}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <SwitchListItem
                            title="Can appeal"
                            description="Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do"
                            value={settings.can_appeal}
                            onValueChange={(v) => onChange({ ...settings, can_appeal: v })}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}
