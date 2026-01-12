import React, { useState } from "react";
import { View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import {api} from "@/src/api/client";
import {hostApi} from "@/src/api/host";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 24 }}>
                <View style={{ gap: 16 }}>
                    <TextField
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email Address"
                    />

                    <TextField
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry={!showPw}
                        onRightIconPress={() => setShowPw((s) => !s)}
                    />

                    <Link href="/">
                        <Text variant="bodyS" style={{ color: "#006FFD" }}>
                            Forgot password?
                        </Text>
                    </Link>
                </View>

                <View style={{ gap: 16 }}>
                    <Button
                        title="Login"
                        variant="primary"
                        onPress={async () => {
                            try {
                                await hostApi.login({ email, password });
                                router.push("/setup");
                            } catch (e: any) {
                                console.log(e);
                            }
                        }}
                    />

                    <View style={{ alignItems: "center" }}>
                        <Text variant="bodyS" style={{ color: "#71727A" }}>
                            Not a member?{" "}
                            <Link href="/signup">
                                <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                    Register now
                                </Text>
                            </Link>
                        </Text>
                    </View>
                </View>
            </View>
        </AuthShell>
    );
}
