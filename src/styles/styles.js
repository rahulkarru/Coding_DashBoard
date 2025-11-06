// Central place for ALL styles & themes
export const baseStyles = {
    page: {
      padding: "20px",
      maxWidth: "1400px",
      margin: "0 auto",
      fontFamily: "Arial, system-ui, -apple-system, Segoe UI, Roboto",
    },
    headerRow: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
    },
    updatedAt: { opacity: 0.7, fontSize: 14 },
    hr: { margin: "20px 0" },
    grid3: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "20px",
      marginBottom: "40px",
    },
    chartWrap: { width: "100%", height: 350 },
    loading: { textAlign: "center", padding: 50 },
    error: { textAlign: "center", padding: 50, color: "red" },
  };
  
  export const platformThemes = {
    Codeforces: {
      border: "#179cde",
      accent: "#179cde",
      gradient: "linear-gradient(135deg, rgba(23,156,222,0.10), rgba(23,156,222,0))",
    },
    CodeChef: {
      border: "#6e4c1e",
      accent: "#3d4451",
      gradient: "linear-gradient(135deg, rgba(109,76,30,0.10), rgba(61,68,81,0))",
    },
    LeetCode: {
      border: "#f89f1b",
      accent: "#f89f1b",
      gradient: "linear-gradient(135deg, rgba(248,159,27,0.10), rgba(248,159,27,0))",
    },
  };
  
  export const cardBase = {
    wrapper: (platformTheme) => ({
      position: "relative",
      border: `2px solid ${platformTheme.border}`,
      padding: 20,
      borderRadius: 12,
      textAlign: "center",
      background: platformTheme.gradient,
      boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      overflow: "hidden",
    }),
    wrapperHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
    logoBg: {
      position: "absolute",
      right: -10,
      top: -10,
      height: "140%",
      opacity: 0.1,
      pointerEvents: "none",
      userSelect: "none",
      transform: "rotate(-12deg)",
      filter: "grayscale(100%)",
    },
    name: { margin: "0 0 10px 0", color: "#444", fontWeight: 700 },
    big: { fontSize: "2.5em", margin: 0, color: "#000", fontWeight: "bold" },
    midAccent: (platformTheme) => ({ margin: "5px 0", color: platformTheme.accent, fontWeight: "bold" }),
    sub: { fontSize: ".9em", color: "#777" },
    link: { textDecoration: "none", color: "inherit" },
  };
  