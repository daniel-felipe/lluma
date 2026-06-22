export default function ClientConfirmacao() {
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

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>App Cliente · Tela 04 / 04</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Agendamento Confirmado</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100% - 28px)", padding: "0 28px", textAlign: "center" }}>
          {/* Success icon */}
          <div style={{ position: "relative" }}>
            <Ann text="Ícone de sucesso — animação de check" top={-20} right={-60} />
            <div style={{ width: 72, height: 72, borderRadius: 36, background: S.greenBg, border: `2px solid ${S.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: S.green, marginBottom: 16 }}>
              ✓
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: S.text, marginBottom: 4 }}>Agendado!</div>
          <div style={{ fontSize: 13, color: S.muted, marginBottom: 28 }}>Seu horário foi confirmado com sucesso.</div>

          {/* Appointment card */}
          <div style={{ position: "relative", width: "100%" }}>
            <Ann text="Resumo completo do agendamento" top={-16} left={0} />
            <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 16, padding: "20px 22px", width: "100%", marginBottom: 24 }}>
              {[
                { label: "Serviço", value: "Corte" },
                { label: "Profissional", value: "Lucas" },
                { label: "Local", value: "Rua das Flores, 123" },
                { label: "Data", value: "Qui, 3 de Abril" },
                { label: "Horário", value: "15:00", highlight: true },
                { label: "Valor", value: "R$ 40,00" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 5 ? `1px solid ${S.wire}` : "none" }}>
                  <span style={{ fontSize: 12, color: S.muted }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: item.highlight ? 900 : 700, color: item.highlight ? S.green : S.text }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div style={{ position: "relative", width: "100%" }}>
            <Ann text="Info do lembrete automático" top={-16} left={0} />
            <div style={{ background: S.greenBg, border: `1px solid ${S.green}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 24, fontSize: 11, color: S.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              Você receberá um lembrete 1h antes via WhatsApp
            </div>
          </div>

          {/* Actions */}
          <div style={{ width: "100%", position: "relative" }}>
            <Ann text="Ações pós-confirmação" top={-16} left={0} />
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "12px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: S.text }}>
                📅 Adicionar ao calendário
              </div>
              <div style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "12px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: S.text }}>
                📍 Ver no mapa
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <Ann text="Reagendar / cancelar" top={-16} right={0} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "12px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: S.muted }}>
                  Reagendar
                </div>
                <div style={{ flex: 1, background: S.bg, border: `1.5px solid #E5737330`, borderRadius: 10, padding: "12px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#E57373" }}>
                  Cancelar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Animação de sucesso no ícone de check (scale + fade in)<br/>
          • Resumo: serviço, profissional, local, data, horário, valor<br/>
          • Lembrete automático via WhatsApp 1h antes<br/>
          • "Adicionar ao calendário" → gera evento .ics ou deeplink para Google Calendar<br/>
          • "Ver no mapa" → abre Google Maps com endereço<br/>
          • Reagendar: abre seletor de horário pré-preenchido<br/>
          • Cancelar: pede confirmação + mostra política de cancelamento<br/>
          • Cancelamento grátis até 2h antes do horário
        </div>
      </div>
    </div>
  );
}
