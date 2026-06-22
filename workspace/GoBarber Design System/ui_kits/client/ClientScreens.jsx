/* @jsx React.createElement */
// Client booking flow screens

const ClientHero = () => (
  <div style={{
    background: "var(--ink-900)",
    color: "var(--bone-50)",
    padding: "20px 20px 24px",
    borderRadius: "0 0 24px 24px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <I.pin />
        <div>
          <div style={{ fontSize: 11, color: "var(--bone-400)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Near you</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Brooklyn, NY</div>
        </div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--amber-500)", color: "#FFF", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>AT</div>
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
      Book a chair.<br/><span style={{ color: "var(--bone-400)" }}>Skip the wait.</span>
    </div>
    <div style={{ position: "relative", marginTop: 20 }}>
      <input placeholder="Search barbers, services" style={{
        width: "100%", padding: "14px 14px 14px 42px",
        border: "none", borderRadius: 10,
        background: "var(--bone-50)", fontSize: 15, fontFamily: "var(--font-body)",
        color: "var(--ink-900)",
      }} />
      <div style={{ position: "absolute", left: 14, top: 14, color: "var(--fg-3)" }}><I.search /></div>
    </div>
  </div>
);

const BarberCard = ({ b, onClick }) => (
  <div onClick={onClick} style={{
    background: "var(--bg-surface)", border: "1px solid var(--bone-200)",
    borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-1)",
    cursor: "pointer",
  }}>
    <div style={{
      height: 120,
      background: b.bg,
      position: "relative",
      display: "grid", placeItems: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 48,
        color: b.fg, letterSpacing: "-0.04em",
      }}>{b.initials}</div>
      {b.next && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(14,13,11,0.7)", backdropFilter: "blur(8px)",
          color: "#FAF7F2", fontSize: 11, fontWeight: 600,
          padding: "4px 8px", borderRadius: 999,
          fontFamily: "var(--font-mono)",
        }}>Next: {b.next}</div>
      )}
    </div>
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink-900)" }}>{b.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-900)", fontWeight: 600 }}>
          <span style={{ color: "var(--amber-500)" }}><I.star size={14} fill="currentColor" /></span>{b.rating}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>{b.shop} · {b.dist}</div>
      <div style={{ fontSize: 13, color: "var(--ink-900)", marginTop: 8, fontFamily: "var(--font-mono)" }}>From ${b.from}</div>
    </div>
  </div>
);

const HomeScreen = ({ barbers, onPick }) => (
  <div style={{ background: "var(--bone-50)", flex: 1 }}>
    <ClientHero />
    <div style={{ padding: "20px 16px 16px" }}>
      <div style={{ display: "flex", gap: 8, overflow: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {["All", "Fades", "Beards", "Lineups", "Color"].map((c, i) => (
          <button key={c} style={{
            appearance: "none", whiteSpace: "nowrap", flexShrink: 0,
            padding: "8px 14px", borderRadius: 999,
            border: i === 0 ? "1px solid var(--ink-900)" : "1px solid var(--bone-300)",
            background: i === 0 ? "var(--ink-900)" : "var(--bg-surface)",
            color: i === 0 ? "var(--bone-50)" : "var(--ink-900)",
            fontWeight: 600, fontSize: 13, fontFamily: "var(--font-body)",
            cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 10 }}>Top barbers nearby</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {barbers.map((b, i) => <BarberCard key={i} b={b} onClick={() => onPick(b)} />)}
      </div>
    </div>
  </div>
);

const TimeSlot = ({ time, active, taken, onClick }) => (
  <button
    disabled={taken}
    onClick={onClick}
    style={{
      appearance: "none",
      padding: "10px 6px",
      borderRadius: 8,
      border: `1px solid ${active ? "var(--ink-900)" : "var(--bone-300)"}`,
      background: active ? "var(--ink-900)" : taken ? "var(--bone-100)" : "var(--bg-surface)",
      color: active ? "var(--bone-50)" : taken ? "var(--fg-4)" : "var(--ink-900)",
      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
      cursor: taken ? "not-allowed" : "pointer",
      textDecoration: taken ? "line-through" : "none",
      fontVariantNumeric: "tabular-nums",
    }}
  >{time}</button>
);

const BookingScreen = ({ b, onBack, onConfirm }) => {
  const [svc, setSvc] = React.useState(0);
  const [time, setTime] = React.useState("2:30pm");
  const services = [
    { name: "Cut",            dur: 30, price: 35 },
    { name: "Cut + beard",    dur: 45, price: 55 },
    { name: "Skin fade",      dur: 30, price: 40 },
    { name: "Lineup",         dur: 15, price: 20 },
  ];
  const slots = [
    { t: "12:00pm", taken: true }, { t: "12:30pm", taken: true },
    { t: "1:00pm",  taken: false }, { t: "1:30pm", taken: false },
    { t: "2:00pm",  taken: true }, { t: "2:30pm", taken: false },
    { t: "3:00pm",  taken: false }, { t: "3:30pm", taken: false },
    { t: "4:00pm",  taken: true }, { t: "4:30pm", taken: false },
  ];
  const chosen = services[svc];
  return (
    <div style={{ background: "var(--bone-50)", flex: 1, position: "relative", paddingBottom: 100 }}>
      {/* Photo header */}
      <div style={{ height: 240, background: b.bg, position: "relative", display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 96, color: b.fg, letterSpacing: "-0.04em" }}>{b.initials}</div>
        <button onClick={onBack} style={{
          position: "absolute", top: 16, left: 16,
          width: 40, height: 40, borderRadius: 999,
          background: "rgba(14,13,11,0.7)", backdropFilter: "blur(8px)",
          color: "#FAF7F2", border: "none", cursor: "pointer",
          display: "grid", placeItems: "center",
        }}><I.arrowL /></button>
      </div>
      <div style={{ padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
          <h1 style={{ flex: 1, minWidth: 0 }}>{b.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", paddingTop: 6, flexShrink: 0 }}>
            <span style={{ color: "var(--amber-500)" }}><I.star size={16} fill="currentColor" /></span>{b.rating} <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>({b.reviews})</span>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-3)", marginBottom: 20 }}>{b.shop} · {b.dist}</div>

        <Eyebrow style={{ marginBottom: 10 }}>Service</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {services.map((s, i) => (
            <div key={i} onClick={() => setSvc(i)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px",
              border: `1px solid ${svc === i ? "var(--ink-900)" : "var(--bone-200)"}`,
              borderRadius: 12,
              background: svc === i ? "var(--ink-900)" : "var(--bg-surface)",
              color: svc === i ? "var(--bone-50)" : "var(--ink-900)",
              cursor: "pointer",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 999,
                border: `2px solid ${svc === i ? "var(--bone-50)" : "var(--bone-300)"}`,
                display: "grid", placeItems: "center",
              }}>
                {svc === i && <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--bone-50)" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.dur} min</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>${s.price}</div>
            </div>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 10 }}>Saturday, Apr 12</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {slots.map((s, i) => (
            <TimeSlot key={i} time={s.t} taken={s.taken} active={time === s.t && !s.taken} onClick={() => setTime(s.t)} />
          ))}
        </div>
      </div>
      {/* Sticky CTA */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "var(--bg-surface)", borderTop: "1px solid var(--bone-200)",
        padding: "14px 16px 28px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>{chosen.name} · {time}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>${chosen.price}</div>
        </div>
        <Button variant="primary" size="lg" onClick={() => onConfirm({ b, svc: chosen, time })}>Book chair</Button>
      </div>
    </div>
  );
};

const ConfirmedScreen = ({ booking, onDone }) => (
  <div style={{ background: "var(--bone-50)", flex: 1, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
    <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--green-500)", color: "#FFF", display: "grid", placeItems: "center", marginBottom: 24 }}>
      <I.check size={36} />
    </div>
    <h1 style={{ fontSize: 28, marginBottom: 8 }}>You're booked.</h1>
    <p style={{ color: "var(--fg-2)", fontSize: 15, marginBottom: 28, maxWidth: 280 }}>
      {booking.b.name} will see you at {booking.time} for a {booking.svc.name.toLowerCase()}.
    </p>
    <Card style={{ width: "100%", padding: 18, textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: "var(--fg-3)", fontSize: 13 }}>Booking</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>BK-9X42T</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: "var(--fg-3)", fontSize: 13 }}>When</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Sat, Apr 12 · {booking.time}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: "var(--fg-3)", fontSize: 13 }}>Where</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{booking.b.shop}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--bone-200)" }}>
        <span style={{ color: "var(--fg-3)", fontSize: 13 }}>Total</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>${booking.svc.price}</span>
      </div>
    </Card>
    <div style={{ marginTop: 24, display: "flex", gap: 8, width: "100%" }}>
      <Button variant="secondary" fullWidth>Add to calendar</Button>
      <Button variant="dark" fullWidth onClick={onDone}>Done</Button>
    </div>
  </div>
);

Object.assign(window, { HomeScreen, BookingScreen, ConfirmedScreen });
