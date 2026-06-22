export default function DashAgendaHoje() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    green: "#2E7D32", greenBg: "#E8F5E9",
    note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right }) => (
    <div style={{ position: "absolute", top, left, right, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  const appointments = [
    { time: "09:00", name: "Rafael M.", service: "Corte", status: "done", price: "R$ 40" },
    { time: "09:45", name: "Pedro S.", service: "Combo", status: "done", price: "R$ 55" },
    { time: "10:30", name: "Lucas T.", service: "Barba", status: "current", price: "R$ 25" },
    { time: "11:00", name: "— vago —", service: "", status: "free", price: "" },
    { time: "11:30", name: "João P.", service: "Corte", status: "upcoming", price: "R$ 40" },
    { time: "14:00", name: "Diego L.", service: "Corte", status: "upcoming", price: "R$ 40" },
    { time: "14:45", name: "Mateus R.", service: "Combo", status: "upcoming", price: "R$ 55" },
  ];

  const statusStyles = {
    done: { bg: S.greenBg, border: `1px solid ${S.green}30`, icon: "✓", iconColor: S.green },
    current: { bg: "#FFF8E1", border: "2px solid #F9A825", icon: "▶", iconColor: "#F9A825" },
    free: { bg: "transparent", border: `1.5px dashed ${S.border}`, icon: "+", iconColor: S.note },
    upcoming: { bg: "transparent", border: `1px solid ${S.wire}`, icon: "", iconColor: "" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 04 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Agenda do Dia — Tela Principal</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ height: "calc(100% - 28px - 56px)", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 0", position: "relative" }}>
            <Ann text="Header: data + ações rápidas" top={0} right={20} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: S.muted }}>Quinta, 3 de Abril</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: S.text }}>Hoje</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: S.text, fontWeight: 600 }}>🔗 Meu link</div>
                <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: S.text, fontWeight: 600 }}>⚙️</div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ position: "relative" }}>
              <Ann text="Métricas do dia — atualizam em tempo real" top={-16} left={0} />
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Agendados", value: "7" },
                  { label: "Concluídos", value: "2" },
                  { label: "Faturamento", value: "R$ 95" },
                ].map((m, i) => (
                  <div key={i} style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: S.text }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div style={{ padding: "0 20px 20px", position: "relative" }}>
            <Ann text="Timeline de agendamentos" top={-4} left={20} />
            <div style={{ marginTop: 12 }} />
            {appointments.map((a, i) => {
              const st = statusStyles[a.status];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", marginBottom: 6, background: st.bg, border: st.border, borderRadius: 10, position: "relative" }}>
                  {i === 2 && <Ann text="Destaque: cliente atual" top={-18} right={0} />}
                  {i === 3 && <Ann text="Slot vago — botão 'encaixe'" top={-18} right={0} />}
                  <div style={{ fontSize: 12, fontWeight: 800, color: a.status === "current" ? "#F9A825" : S.muted, minWidth: 40, fontVariantNumeric: "tabular-nums" }}>{a.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: a.status === "free" ? 400 : 700, color: a.status === "free" ? S.dim : S.text }}>{a.name}</div>
                    {a.service && <div style={{ fontSize: 11, color: S.muted }}>{a.service} · {a.price}</div>}
                  </div>
                  {st.icon && (
                    <span style={{ fontSize: a.status === "free" ? 14 : 12, color: st.iconColor, fontWeight: 800 }}>{st.icon}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: S.bg, borderTop: `1.5px solid ${S.wire}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <Ann text="Navegação inferior — 3 abas" top={-18} left={"50%"} />
          {[
            { label: "Hoje", icon: "📋", active: true },
            { label: "Semana", icon: "📅", active: false },
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
          • Tela principal — primeira tela após login<br/>
          • Status dos agendamentos: concluído (verde), em atendimento (destaque amarelo), próximos, vago<br/>
          • Slot vago permite "encaixe" — abre seletor de cliente ou aceita walk-in<br/>
          • Métricas: agendados, concluídos e faturamento parcial do dia<br/>
          • Swipe no card do cliente: marcar como concluído, cancelar, ou no-show<br/>
          • Notificação push quando novo agendamento chega<br/>
          • Navbar: Hoje (tela atual), Semana (tela 05), Link (tela 06)
        </div>
      </div>
    </div>
  );
}
