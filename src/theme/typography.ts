export const typography = {
    fontFamily: {
        regular: "InterRegular",
        medium: "InterMedium",
        semibold: "InterSemiBold",
        bold: "InterBold",
        extrabold: "InterExtraBold",
    },

    heading: {
        h1: { fontSize: 24, lineHeight: 24, fontFamily: "InterExtraBold" },
        h2: { fontSize: 18, lineHeight: 18, fontFamily: "InterExtraBold" },
        h3: { fontSize: 16, lineHeight: 16, fontFamily: "InterExtraBold" },
        h4: { fontSize: 14, lineHeight: 14, fontFamily: "InterBold" },
        h5: { fontSize: 12, lineHeight: 12, fontFamily: "InterSemiBold" },
    },

    body: {
        xl: { fontSize: 18, lineHeight: 24, fontFamily: "InterRegular" },
        l: { fontSize: 16, lineHeight: 22, fontFamily: "InterRegular" },
        m: { fontSize: 14, lineHeight: 20, fontFamily: "InterRegular" },
        s: { fontSize: 12, lineHeight: 16, fontFamily: "InterRegular" },
        xs: { fontSize: 10, lineHeight: 14, fontFamily: "InterRegular" },
    },

    action: {
        l: { fontSize: 14, lineHeight: 16, fontFamily: "InterSemiBold" },
        m: { fontSize: 12, lineHeight: 14, fontFamily: "InterSemiBold" },
        s: { fontSize: 10, lineHeight: 12, fontFamily: "InterSemiBold" },
    },

    caption: {
        m: { fontSize: 12, lineHeight: 14, fontFamily: "InterMedium" },
        s: { fontSize: 10, lineHeight: 12, fontFamily: "InterMedium" },
    },
} as const;
