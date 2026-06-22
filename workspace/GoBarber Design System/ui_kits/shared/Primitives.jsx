/* @jsx React.createElement */
// Shared UI primitives for both barber + client kits.
// Drop into window for cross-script use.

const Avatar = ({ initials, size = 40, tone = "ink", status }) => {
  const tones = {
    ink:    { bg: "var(--ink-900)", fg: "var(--bone-50)" },
    amber:  { bg: "var(--amber-500)", fg: "#FFF" },
    bone:   { bg: "var(--bone-100)", fg: "var(--ink-900)", border: "1px solid var(--bone-200)" },
  };
  const t = tones[tone] || tones.ink;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: t.bg, color: t.fg, border: t.border,
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-display)", fontWeight: 600,
      fontSize: size * 0.36, letterSpacing: "-0.02em",
      flexShrink: 0, position: "relative",
    }}>
      {initials}
      {status && <span style={{
        position: "absolute", right: -1, bottom: -1,
        width: size * 0.32, height: size * 0.32, borderRadius: 999,
        border: "2px solid var(--bg-surface)",
        background: status === "ok" ? "var(--green-500)" : status === "pending" ? "var(--amber-400)" : "var(--bone-400)",
      }} />}
    </div>
  );
};

const Pill = ({ tone = "neutral", children }) => {
  const tones = {
    ok:      { bg: "#E0EBDA", fg: "#2F4A2C", dot: "#4F7A4A" },
    pending: { bg: "#FBF1E6", fg: "#6B3D10", dot: "#D98B2F" },
    danger:  { bg: "#F4DDD5", fg: "#6E2A19", dot: "#B5462E" },
    info:    { bg: "#DCE4EE", fg: "#25395B", dot: "#3D5A7A" },
    neutral: { bg: "var(--bone-100)", fg: "var(--ink-900)", dot: "var(--bone-500)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: t.bg, color: t.fg,
      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
      letterSpacing: "0.02em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }} />
      {children}
    </span>
  );
};

const Button = ({ variant = "primary", size = "md", children, onClick, style, type = "button", icon, fullWidth }) => {
  const variants = {
    primary:   { bg: "var(--amber-500)", fg: "#FFF", border: "transparent", hover: "var(--amber-600)" },
    dark:      { bg: "var(--ink-900)", fg: "var(--bone-50)", border: "transparent", hover: "var(--ink-800)" },
    secondary: { bg: "#FFF", fg: "var(--ink-900)", border: "var(--bone-300)", hover: "var(--bone-100)" },
    ghost:     { bg: "transparent", fg: "var(--ink-900)", border: "transparent", hover: "var(--bone-100)" },
    danger:    { bg: "var(--red-500)", fg: "#FFF", border: "transparent", hover: "#9A3925" },
  };
  const sizes = {
    sm: { px: 12, py: 8,  fs: 13 },
    md: { px: 18, py: 12, fs: 15 },
    lg: { px: 22, py: 16, fs: 16 },
  };
  const v = variants[variant], s = sizes[size];
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onTouchStart={() => setPress(true)}
      onTouchEnd={() => setPress(false)}
      style={{
        appearance: "none", cursor: "pointer",
        background: hover ? v.hover : v.bg,
        color: v.fg,
        border: `1px solid ${v.border === "transparent" ? "transparent" : `var(--bone-300)`}`,
        borderColor: v.border === "transparent" ? "transparent" : v.border,
        padding: `${s.py}px ${s.px}px`,
        borderRadius: 8,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: s.fs,
        letterSpacing: "-0.01em",
        transform: press ? "scale(0.97)" : "scale(1)",
        transition: "background 120ms var(--ease-out), transform 120ms var(--ease-out)",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
};

const Card = ({ children, style, dark = false, onClick }) => (
  <div onClick={onClick} style={{
    background: dark ? "var(--ink-800)" : "var(--bg-surface)",
    border: `1px solid ${dark ? "var(--ink-700)" : "var(--bone-200)"}`,
    borderRadius: 12,
    padding: 16,
    boxShadow: dark ? "none" : "var(--shadow-1)",
    cursor: onClick ? "pointer" : "default",
    ...style,
  }}>{children}</div>
);

const Eyebrow = ({ children, style }) => (
  <div style={{
    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--fg-3)", ...style,
  }}>{children}</div>
);

// Icons — inline Lucide-style 24x24, currentColor stroke.
const I = {
  calendar: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock:    (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  user:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  users:    (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  search:   (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  bell:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  money:    (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  settings: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.14.7.36 1 .68"/></svg>,
  arrowR:   (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  arrowL:   (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  check:    (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  x:        (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  pin:      (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  star:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill={p?.fill || "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  home:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  more:     (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  message:  (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>,
  scissors: (p) => <svg width={p?.size||20} height={p?.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
};

const PhoneFrame = ({ children, dark }) => (
  <div style={{
    width: 390, height: 800,
    borderRadius: 36,
    background: dark ? "var(--ink-900)" : "var(--bone-50)",
    border: "1px solid var(--ink-700)",
    overflow: "hidden",
    boxShadow: "var(--shadow-3)",
    position: "relative",
    display: "flex", flexDirection: "column",
  }}>
    {/* status bar */}
    <div style={{
      height: 44, padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
      color: dark ? "var(--bone-50)" : "var(--ink-900)",
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="6" width="3" height="6" rx="1"/><rect x="5" y="3" width="3" height="9" rx="1"/><rect x="10" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4a8 8 0 0 1 12 0M3 6a5 5 0 0 1 8 0M5.5 8a2 2 0 0 1 3 0"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="18" height="10" rx="2"/><rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/><rect x="20" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
      </span>
    </div>
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
);

Object.assign(window, { Avatar, Pill, Button, Card, Eyebrow, I, PhoneFrame });
