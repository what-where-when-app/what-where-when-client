export const tokens = {
    color: {
        bg: "#0B0F17",
        surface: "#111827",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        primary: "#4F46E5",
        danger: "#EF4444",
        border: "rgba(255,255,255,0.12)",
    },
    space: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        8: 32,
    },
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },
    font: {
        size: {
            sm: 14,
            md: 16,
            lg: 20,
            xl: 28,
        },
        weight: {
            regular: "400" as const,
            medium: "500" as const,
            bold: "700" as const,
        },
    },
} as const;
