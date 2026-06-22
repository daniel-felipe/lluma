export default function DashSetupHorarios() {
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

  const days = [
    { day: "Segunda", from: "09:00", to: "19:00", active: true },
    { day: "Terça", from: "09:00", to: "19:00", active: true },
    { day: "Quarta", from: "09:00", to: "19:00", active: true },
    { day: "Quinta", from: "09:00", to: "19:00", active: true },
    { day: "Sexta", from: "09:00", to: "20:00", active: true },
    { day: "Sábado", from: "08:00", to: "17:00", active: true },
    { day: "Domingo", from: "—", to: "—", active: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 03 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Setup — Horário de Funcionamento</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ padding: 24, height: "calc(100% - 28px)", overflowY: "auto" }}>
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: S.text }} />
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: S.text }} />
          </div>
          <div style={{ fontSize: 10, color: S.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>PASSO 2 DE 2</div>

          <div style={{ fontSize: 19, fontWeight: 800, color: S.text, marginBottom: 4 }}>Horário de funcionamento</div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 20 }}>Defina quando você atende.</div>

          {/* Days list */}
          <div style={{ position: "relative" }}>
            <Ann text="Lista de dias — toggle + seletores de hora" top={-16} left={0} />
          </div>
          {days.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${S.wire}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 110 }}>
                <div style={{ width: 34, height: 18, borderRadius: 9, background: d.active ? S.text : S.wire, position: "relative" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FFF", position: "absolute", top: 3, left: d.active ? 19 : 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: d.active ? S.text : S.dim }}>{d.day}</span>
              </div>
              {d.active ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                  {i === 0 && <Ann text="Time pickers" top={-20} right={0} />}
                  <span style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: S.text, fontWeight: 600 }}>{d.from}</span>
                  <span style={{ color: S.dim, fontSize: 10 }}>até</span>
                  <span style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: S.text, fontWeight: 600 }}>{d.to}</span>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: S.dim, fontWeight: 600 }}>Fechado</span>
              )}
            </div>
          ))}

          {/* Interval */}
          <div style={{ position: "relative", marginTop: 20 }}>
            <Ann text="Intervalo entre atendimentos" top={-16} left={0} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.text }}>Intervalo entre clientes</div>
                <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>Tempo de preparo entre atendimentos</div>
              </div>
              <span style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: S.text, fontWeight: 600 }}>10 min</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ position: "relative", marginTop: 24 }}>
            <Ann text="Conclui onboarding → vai para tela 'Hoje'" top={-16} right={0} />
            <div style={{ width: "100%", background: S.text, color: S.bg, borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              Concluir setup ✓
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Cada dia: toggle ativo + horário de início e fim<br/>
          • Time picker nativo (dropdown ou scroll wheel)<br/>
          • Intervalo entre clientes: 0, 5, 10, 15, 30 min<br/>
          • Horário de almoço pode ser adicionado como bloqueio (fase 2)<br/>
          • Ao concluir, gera automaticamente os slots disponíveis
        </div>
      </div>
    </div>
  );
}
