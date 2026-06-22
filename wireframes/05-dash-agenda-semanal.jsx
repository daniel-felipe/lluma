export default function DashAgendaSemanal() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right }) => (
    <div style={{ position: "absolute", top, left, right, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  const days = ["Seg","Ter","Qua","Qui","Sex","Sáb"];
  const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
  
  const blocks = {
    "Qui-09:00": "Rafael", "Qui-10:00": "Pedro", "Qui-10:30": "Lucas",
    "Qui-11:30": "João", "Qui-14:00": "Diego", "Qui-15:00": "Ana",
    "Sex-09:00": "Carlos", "Sex-10:00": "Marcos", "Sex-14:00": "Thiago",
    "Sáb-08:00": "Felipe", "Sáb-09:00": "Gustavo", "Sáb-10:00": "Vitor", "Sáb-11:00": "Renan",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 05 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Agenda Semanal</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ height: "calc(100% - 28px - 56px)", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", position: "relative" }}>
            <Ann text="Navegação entre semanas (← →)" top={0} right={20} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: S.muted }}>31 Mar — 5 Abr</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: S.text }}>Semana</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: S.muted }}>‹</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: S.muted }}>›</div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "0 8px 8px", position: "relative" }}>
            <Ann text="Grid semanal — scroll horizontal e vertical" top={0} left={8} />
            <div style={{ display: "grid", gridTemplateColumns: "40px repeat(6, 1fr)", gap: 0, minWidth: 460, marginTop: 16 }}>
              {/* Day headers */}
              <div />
              {days.map((d, i) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: d === "Qui" ? S.note : S.muted, padding: "4px 0", borderBottom: `1.5px solid ${S.border}` }}>
                  {d}
                  <div style={{ fontSize: 14, fontWeight: 900, color: d === "Qui" ? S.text : S.muted, marginTop: 2 }}>
                    {["31","01","02","03","04","05"][i]}
                  </div>
                </div>
              ))}

              {/* Hour rows */}
              {hours.map(h => ([
                <div key={`h-${h}`} style={{ fontSize: 9, color: S.dim, paddingRight: 4, paddingTop: 3, textAlign: "right", borderTop: `1px solid ${S.wire}`, fontVariantNumeric: "tabular-nums" }}>{h}</div>,
                ...days.map(d => {
                  const name = blocks[`${d}-${h}`];
                  return (
                    <div key={`${d}-${h}`} style={{ borderTop: `1px solid ${S.wire}`, borderLeft: `1px solid ${S.wire}`, minHeight: 28, padding: 1 }}>
                      {name && (
                        <div style={{ background: `${S.note}15`, border: `1px solid ${S.note}30`, borderRadius: 3, padding: "2px 4px", fontSize: 8, color: S.note, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </div>
                      )}
                    </div>
                  );
                })
              ]).flat())}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: S.bg, borderTop: `1.5px solid ${S.wire}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          {[
            { label: "Hoje", icon: "📋", active: false },
            { label: "Semana", icon: "📅", active: true },
            { label: "Link", icon: "🔗", active: false },
          ].map((n, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{n.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: n.active ? S.text : S.dim, marginTop: 1 }}>{n.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Grid de 7 dias × slots de horário<br/>
          • Scroll horizontal para ver todos os dias<br/>
          • Dia atual destacado no header<br/>
          • Tap no bloco abre detalhes do agendamento<br/>
          • Tap em célula vazia → agendamento manual rápido<br/>
          • Navegação ← → para semanas anteriores/próximas<br/>
          • Blocos coloridos por status (confirmado, pendente)
        </div>
      </div>
    </div>
  );
}
