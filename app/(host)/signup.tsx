import React, { useState } from "react";
import { View } from "react-native";
import { useRouter, Link } from "expo-router";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { Checkbox } from "@/src/ui/Checkbox";

export default function SignupScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [agree, setAgree] = useState(false);

    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 12 }}>
                <View style={{ gap: 4, marginBottom: 8 }}>
                    <Text variant="h3">Sign up</Text>
                    <Text variant="bodyS" style={{ color: "#71727A" }}>
                        Create an account to get started
                    </Text>
                </View>

                <Text variant="bodyS" style={{ fontWeight: "600" as any }}>Name</Text>
                <TextField value={name} onChangeText={setName} placeholder="Name" />

                <Text variant="bodyS" style={{ fontWeight: "600" as any }}>Email Address</Text>
                <TextField value={email} onChangeText={setEmail} placeholder="name@email.com" />

                <Text variant="bodyS" style={{ fontWeight: "600" as any }}>Password</Text>
                <TextField
                    value={pw}
                    onChangeText={setPw}
                    placeholder="Create a password"
                    secureTextEntry={!showPw}
                    rightIcon={<Text variant="captionM">{showPw ? "🙈" : "👁️"}</Text>}
                    onRightIconPress={() => setShowPw((s) => !s)}
                />

                <TextField
                    value={pw2}
                    onChangeText={setPw2}
                    placeholder="Confirm password"
                    secureTextEntry={!showPw2}
                    rightIcon={<Text variant="captionM">{showPw2 ? "🙈" : "👁️"}</Text>}
                    onRightIconPress={() => setShowPw2((s) => !s)}
                />

                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 }}>
                    <Checkbox checked={agree} onChange={setAgree} />
                    <Text variant="bodyS" style={{ color: "#71727A", flex: 1 }}>
                        I&apos;ve read and agree with the{" "}
                        <Link href="/">
                            <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                Terms and Conditions
                            </Text>
                        </Link>{" "}
                        and the{" "}
                        <Link href="/">
                            <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                Privacy Policy
                            </Text>
                        </Link>
                        .
                    </Text>
                </View>

                <View style={{ marginTop: 8 }}>
                    <Button
                        title="Login"
                        variant="primary"
                        disabled={!agree || !email || !pw || pw !== pw2}
                        onPress={() => router.push("/setup")}
                    />
                </View>
            </View>
        </AuthShell>
    );
}
