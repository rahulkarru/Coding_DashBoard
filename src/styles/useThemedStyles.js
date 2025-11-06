// src/styles/useThemedStyles.js
import { useEffect, useMemo, useState } from "react";

const usePrefersDark = () => {
  const get = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDark, setIsDark] = useState(get());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  return isDark;
};

const useThemedStyles = () => {
  const isDark = usePrefersDark();

  const theme = useMemo(
    () => ({
      isDark,
      bg: isDark ? "#0b0f14" : "#f7f8fb",
      cardBG: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
      cardBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(20,20,20,0.08)",
      text: isDark ? "#e6ebf2" : "#0f172a",
      subtext: isDark ? "#95a2b3" : "#5b6471",
      gridLine: isDark ? "#1d2633" : "#e6e9ef",
      shadow: isDark ? "0 10px 30px rgba(0,0,0,0.45)" : "0 10px 30px rgba(20,20,20,0.10)",
      heroGrad: isDark
        ? "radial-gradient(1200px 500px at 100% -10%, rgba(23,156,222,0.15), transparent), radial-gradient(800px 400px at -20% 10%, rgba(248,159,27,0.12), transparent)"
        : "radial-gradient(1200px 500px at 100% -10%, rgba(23,156,222,0.18), transparent), radial-gradient(800px 400px at -20% 10%, rgba(248,159,27,0.16), transparent)",
    }),
    [isDark]
  );

  const baseStyles = useMemo(
    () => ({
      page: {
        padding: "28px clamp(12px, 5vw, 32px)",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Roboto, Arial",
        color: theme.text,
        background: theme.heroGrad,
        minHeight: "100dvh",
      },
      headerCard: {
        padding: "18px clamp(12px, 4vw, 24px)",
        borderRadius: 16,
        backdropFilter: "blur(8px)",
        background: theme.cardBG,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.shadow,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      },
      title: { margin: 0, fontSize: "clamp(20px, 2.2vw, 28px)", letterSpacing: 0.2 },
      updatedAt: { opacity: 0.75, fontSize: 13, color: theme.subtext },
      hr: { margin: "22px 0", border: "none", height: 1, background: theme.cardBorder },
      gridCards: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "18px",
        marginBottom: 24,
      },
      sectionTitle: { margin: "18px 0 10px", fontSize: "clamp(18px, 1.8vw, 22px)" },
      chartWrap: (h) => ({ width: "100%", height: h }),
      loading: { textAlign: "center", padding: 50, color: theme.subtext },
      error: { textAlign: "center", padding: 50, color: "#e74c3c" },
      linkButton: {
        fontSize: 13,
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${theme.cardBorder}`,
        background: theme.cardBG,
        color: theme.text,
        textDecoration: "none",
        transition: "all .2s ease",
      },
    }),
    [theme]
  );

  const platformThemes = {
    Codeforces: {
      border: "#179cde",
      accent: "#179cde",
      gradient: isDark
        ? "linear-gradient(135deg, rgba(23,156,222,0.12), rgba(23,156,222,0.00))"
        : "linear-gradient(135deg, rgba(23,156,222,0.14), rgba(23,156,222,0.00))",
      glow: "0 10px 25px rgba(23,156,222,0.25)",
    },
    CodeChef: {
      border: "#6e4c1e",
      accent: "#c9a26a",
      gradient: isDark
        ? "linear-gradient(135deg, rgba(109,76,30,0.12), rgba(109,76,30,0.00))"
        : "linear-gradient(135deg, rgba(109,76,30,0.10), rgba(61,68,81,0.00))",
      glow: "0 10px 25px rgba(109,76,30,0.22)",
    },
    LeetCode: {
      border: "#f89f1b",
      accent: "#f89f1b",
      gradient: isDark
        ? "linear-gradient(135deg, rgba(248,159,27,0.12), rgba(248,159,27,0.00))"
        : "linear-gradient(135deg, rgba(248,159,27,0.14), rgba(248,159,27,0.00))",
      glow: "0 10px 25px rgba(248,159,27,0.25)",
    },
  };

  const cardBase = {
    link: { textDecoration: "none", color: "inherit" },
    wrapper: (pt) => ({
      position: "relative",
      border: `1px solid ${theme.cardBorder}`,
      padding: 20,
      borderRadius: 16,
      textAlign: "center",
      background: `${pt.gradient}, ${theme.cardBG}`,
      boxShadow: `${theme.shadow}, ${pt.glow}`,
      transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
      overflow: "hidden",
    }),
    wrapperHover: { transform: "translateY(-4px)" },
    logoBg: {
      position: "absolute",
      right: -18,
      top: -18,
      height: "160%",
      opacity: 0.065,
      pointerEvents: "none",
      userSelect: "none",
      transform: "rotate(-12deg)",
      filter: "grayscale(100%)",
    },
    name: { margin: "0 0 8px 0", color: theme.subtext, fontWeight: 700, letterSpacing: ".2px" },
    big: { fontSize: "clamp(28px, 4.8vw, 40px)", margin: 0, color: theme.text, fontWeight: 800 },
    midAccent: (pt) => ({ margin: "6px 0", color: pt.accent, fontWeight: 700, fontSize: "clamp(12px, 1.6vw, 14px)" }),
    sub: { fontSize: "clamp(12px, 1.5vw, 13px)", color: theme.subtext },
    chipRow: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 8 },
    chip: (pt) => ({
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      border: `1px solid ${pt.accent}33`,
      background: `${pt.accent}14`,
      color: pt.accent,
    }),
    tooltip: { backgroundColor: theme.cardBG, border: `1px solid ${theme.cardBorder}`, color: theme.text },
    axis: { fill: theme.subtext, fontSize: 12 },
    gridStroke: theme.gridLine,
  };

  return { baseStyles, platformThemes, cardBase, theme };
};

export default useThemedStyles;
