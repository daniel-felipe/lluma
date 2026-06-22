/* @jsx React.createElement */
// Barber dashboard screens

const HeroToday = ({ earnings, bookings }) => (
  <div style={{
    background: "var(--ink-900)",
    color: "var(--bone-50)",
    padding: "20px 20px 28px",
    borderRadius: "0 0 24px 24px",
    position: "relative",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <Eyebrow style={{ color: "var(--bone-400)" }}>Saturday · Apr 12</Eyebrow>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={iconBtnDark}><I.search /></button>
        <button style={iconBtnDark}><I.bell /></button>
      </div>
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em" }}>
      Morning, Marcus.
    </div>
    <div style={{ color: "var(--bone-300)", fontSize: 15, marginTop: 4 }}>
      6 on the books today.
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
      <div style={statTile}>
        <Eyebrow style={{ color: "var(--bone-400)" }}>Today's take</Eyebrow>
        <div style={statBig}>${earnings}</div>
      </div>
      <div style={statTile}>
        <Eyebrow style={{ color: "var(--bone-400)" }}>Booked</Eyebrow>
        <div style={statBig}>{bookings}<span style={{ color: "var(--bone-400)", fontSize: 18 }}> / 8</span></div>
      </div>
    </div>
  </div>
);
const iconBtnDark = {
  width: 36, height: 36, borderRadius: 999, background: "var(--ink-800)",
  border: "1px solid var(--ink-700)", color: "var(--bone-50)",
  display: "grid", placeItems: "center", cursor: "pointer",
};
const statTile = {
  background: "var(--ink-800)", border: "1px solid var(--ink-700)",
  borderRadius: 12, padding: "12px 14px",
};
const statBig = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26,
  letterSpacing: "-0.02em", color: "var(--bone-50)",
  marginTop: 4, fontVariantNumeric: "tabular-nums",
};

const BookingRow = ({ b, active, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px",
    background: active ? "var(--amber-50)" : "var(--bg-surface)",
    border: `1px solid ${active ? "var(--amber-200)" : "var(--bone-200)"}`,
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: active ? "var(--shadow-2)" : "var(--shadow-1)",
  }}>
    <div style={{ width: 56, textAlign: "right", flexShrink: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink-900)", fontVariantNumeric: "tabular-nums" }}>{b.time}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>{b.dur}m</div>
    </div>
    <Avatar initials={b.initials} size={40} tone={b.tone || "ink"} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>{b.name}</div>
      <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>{b.service}</div>
    </div>
    {b.status && <Pill tone={b.status}>{b.statusLabel}</Pill>}
  </div>
);

const TabBar = ({ tab, setTab }) => {
  const items = [
    { id: "today",    label: "Today",    icon: I.calendar },
    { id: "clients",  label: "Clients",  icon: I.users },
    { id: "earnings", label: "Earnings", icon: I.money },
    { id: "settings", label: "Settings", icon: I.settings },
  ];
  return (
    <div style={{
      borderTop: "1px solid var(--bone-200)",
      background: "var(--bg-surface)",
      padding: "8px 8px 20px",
      display: "flex", justifyContent: "space-around",
      flexShrink: 0,
    }}>
      {items.map(it => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            appearance: "none", background: "transparent", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "6px 12px", cursor: "pointer",
            color: active ? "var(--accent)" : "var(--fg-3)",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
          }}>
            <it.icon size={22} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
};

const TodayScreen = ({ bookings, onPick }) => (
  <div style={{ background: "var(--bone-50)", flex: 1 }}>
    <HeroToday earnings="285" bookings={bookings.filter(b=>b.status==="ok").length} />
    <div style={{ padding: "20px 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>On the books</Eyebrow>
        <button style={{ appearance: "none", background: "transparent", border: "none", color: "var(--accent)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>View week</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bookings.map((b, i) => <BookingRow key={i} b={b} active={b.active} onClick={() => onPick(b)} />)}
      </div>
    </div>
  </div>
);

const ClientsScreen = () => {
  const list = [
    { name: "Marcus Reyes",   last: "3 weeks ago", visits: 14, tone: "ink",   initials: "MR" },
    { name: "Jamal Torres",   last: "Last week",    visits: 8,  tone: "amber", initials: "JT" },
    { name: "Sam Kim",        last: "2 days ago",   visits: 22, tone: "bone",  initials: "SK" },
    { name: "Diego Alvarez",  last: "Today",        visits: 5,  tone: "ink",   initials: "DA" },
    { name: "Theo Brennan",   last: "1 month ago",  visits: 11, tone: "amber", initials: "TB" },
  ];
  return (
    <div style={{ background: "var(--bone-50)", flex: 1, padding: "16px" }}>
      <h1 style={{ marginBottom: 12 }}>Clients</h1>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input placeholder="Search by name or phone" style={{
          width: "100%", padding: "12px 14px 12px 40px",
          border: "1px solid var(--bone-300)", borderRadius: 8,
          background: "var(--bg-surface)", fontSize: 15, fontFamily: "var(--font-body)",
        }} />
        <div style={{ position: "absolute", left: 12, top: 12, color: "var(--fg-4)" }}><I.search /></div>
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>Regulars</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((c, i) => (
          <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
            <Avatar initials={c.initials} tone={c.tone} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink-900)" }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>Last visit {c.last} · {c.visits} cuts</div>
            </div>
            <I.arrowR />
          </Card>
        ))}
      </div>
    </div>
  );
};

const EarningsScreen = () => (
  <div style={{ background: "var(--bone-50)", flex: 1, padding: "16px" }}>
    <h1 style={{ marginBottom: 16 }}>Earnings</h1>
    <Card style={{ padding: 20, marginBottom: 12 }}>
      <Eyebrow>This week</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>$1,640</div>
        <div style={{ color: "var(--green-500)", fontWeight: 600, fontSize: 14 }}>+12%</div>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
        {[40, 65, 50, 70, 90, 55, 75].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 4 ? "var(--amber-500)" : "var(--ink-900)", borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-4)" }}>
        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
      </div>
    </Card>
    <Eyebrow style={{ marginTop: 12, marginBottom: 8 }}>Recent</Eyebrow>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { who: "Sam Kim",       svc: "Cut + beard",   amt: 55, time: "Today · 11:30am" },
        { who: "Jamal Torres",  svc: "Skin fade",      amt: 40, time: "Today · 10:00am" },
        { who: "Diego Alvarez", svc: "Cut",            amt: 35, time: "Yesterday · 6pm" },
      ].map((r, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", padding: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{r.who}</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{r.svc} · {r.time}</div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>${r.amt}</div>
        </Card>
      ))}
    </div>
  </div>
);

const BookingDetailSheet = ({ b, onClose }) => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 5,
    background: "rgba(14,13,11,0.6)", backdropFilter: "blur(8px)",
    display: "flex", flexDirection: "column", justifyContent: "flex-end",
    animation: "fadeIn 200ms var(--ease-out)",
  }} onClick={onClose}>
    <div onClick={(e)=>e.stopPropagation()} style={{
      background: "var(--bg-surface)",
      borderRadius: "16px 16px 0 0",
      padding: "20px 20px 28px",
      animation: "slideUp 320ms var(--ease-out)",
    }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--bone-300)", margin: "0 auto 16px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar initials={b.initials} tone={b.tone || "ink"} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{b.name}</div>
          <div style={{ fontSize: 13, color: "var(--fg-3)" }}>Regular · 14 cuts with you</div>
        </div>
        <button onClick={onClose} style={{ ...iconBtnDark, background: "var(--bone-100)", borderColor: "var(--bone-200)", color: "var(--ink-900)" }}><I.x /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "var(--bone-50)", borderRadius: 12, padding: 14 }}>
          <Eyebrow>Time</Eyebrow>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{b.time}</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>{b.dur} min</div>
        </div>
        <div style={{ background: "var(--bone-50)", borderRadius: 12, padding: 14 }}>
          <Eyebrow>Service</Eyebrow>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4 }}>${b.price || 45}</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>{b.service}</div>
        </div>
      </div>
      <div style={{ background: "var(--bone-50)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <Eyebrow>Notes</Eyebrow>
        <div style={{ fontSize: 14, marginTop: 6, color: "var(--fg-2)" }}>Tighter on the sides than last time. Keep the top length.</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="secondary" fullWidth>Reschedule</Button>
        <Button variant="dark" fullWidth icon={<I.message size={18} />}>Message</Button>
      </div>
    </div>
  </div>
);

Object.assign(window, { TodayScreen, ClientsScreen, EarningsScreen, BookingDetailSheet, TabBar });
