import {Pressable, View} from "react-native";
import {TextField} from "@/src/ui/TextField";
import {ListItem} from "@/src/ui/ListItem";
import {Icon} from "@/src/ui/Icon";

export function GameMetaRow({ title, date_of_event, passcode, onChangeTitle, onChangeDate }: Props) {
    return (
        <View style={{ flexDirection: "row", gap: 60, alignItems: "flex-start", paddingHorizontal: 16 }}>
            <View style={{ flex: 1 }}>
                <TextField
                    label="Title"
                    value={title}
                    placeholder="Placeholder"
                    onChangeText={onChangeTitle}
                />
            </View>

            <View style={{ flex: 1 }}>
                <TextField
                    label="Date of event"
                    value={date_of_event}
                    placeholder="eg 23-01-2026"
                    onChangeText={onChangeDate}
                    helperText="Date should be in format dd-mm-yyyy"
                />
            </View>

            <View style={{ flex: 1, alignSelf: "center" }}>
                {passcode ?
                    <ListItem
                        variant="highlight"
                        title={passcode}
                        description="Game code to share among teams"
                        right={
                            <Pressable>
                                <Icon name="copy" />
                            </Pressable>
                        }
                    />
                    : null}
            </View>
        </View>
    );
}
