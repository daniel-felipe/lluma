export default function ClientHorario() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    selected: "#1A1A1A", selectedBg: "#1A1A1A",
    note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right }) => (
    <div style={{ position: "absolute", top, left, right, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  const days = [
    { day: "Seg", num: "31", month: "Mar", selected: false },
    { day: "Ter", num: "01", month: "Abr", selected: false },
    { day: "Qua", num: "02", month: "Abr", selected: false },
    { day: "Qui", num: "03", month: "Abr", selected: true },
    { day: "Sex", num: "04", month: "Abr", selected: false },
    { day: "Sáb", num: "05", month: "Abr", selected: false },
  ];

  const times = [
    { time: "11:00", available: true, selected: false },
    { time: "14:00", available: true, selected: false },
    { time: "14:30", available: false, selected: false },
    { time: "15:00", available: true, selected: true },
    { time: "15:30", available: true, selected: false },
    { time: "16:00", available: true, selected: false },
    { time: "16:30", available: false, selected: false },
    { time: "17:00", available: true, selected: false },
    { time: "17:30", available: true, selected: false },
    { time: "18:00", available: true, selected: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>App Cliente · Tela 03 / 04</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Seleção de Horário</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ height: "calc(100% - 28px)", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ fontSize: 12, color: S.note, fontWeight: 600, marginBottom: 10 }}>← Voltar</div>
            <div style={{ position: "relative" }}>
              <Ann text="Título + contexto do serviço escolhido" top={-16} right={0} />
              <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 2 }}>Escolha o horário</div>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 18 }}>Corte · R$ 40 · 30 min · Lucas Barber</div>
            </div>

            {/* Day selector */}
            <div style={{ position: "relative" }}>
              <Ann text="Seletor de dia — scroll horizontal" top={-16} left={0} />
              <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
                {days.map((d, i) => (
                  <div key={i} style={{
                    minWidth: 50, textAlign: "center", padding: "8px 6px", borderRadius: 10,
                    background: d.selected ? S.selectedBg : S.bg,
                    border: `1.5px solid ${d.selected ? S.selectedBg : S.border}`,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: d.selected ? S.bg : S.dim }}>{d.day}</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: d.selected ? S.bg : S.text, marginTop: 2 }}>{d.num}</div>
                    <div style={{ fontSize: 8, color: d.selected ? S.bg : S.dim }}>{d.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time grid */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
            <div style={{ position: "relative" }}>
              <Ann text="Grid de horários disponíveis" top={-4} left={0} />
              <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, marginBottom: 10, marginTop: 8 }}>Horários disponíveis</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {times.map((t, i) => (
                <div key={i} style={{
                  textAlign: "center", padding: "14px 0", borderRadius: 10, position: "relative",
                  background: t.selected ? S.selectedBg : S.bg,
                  border: `1.5px solid ${t.selected ? S.selectedBg : S.border}`,
                  opacity: t.available ? 1 : 0.25,
                }}>
                  {i === 2 && <Ann text="Indisponível — riscado ou opaco" top={-18} right={-8} />}
                  {i === 3 && <Ann text="Selecionado — destaque forte" top={-18} left={-8} />}
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.selected ? S.bg : (t.available ? S.text : S.dim) }}>
                    {t.time}
                  </div>
                  {!t.available && (
                    <div style={{ fontSize: 9, color: S.dim, marginTop: 2 }}>Indisponível</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: "16px 20px 24px", position: "relative" }}>
            <Ann text="CTA confirma agendamento → tela 04" top={-16} right={0} />
            <div style={{ background: S.text, color: S.bg, borderRadius: 12, padding: "16px 0", textAlign: "center", fontSize: 15, fontWeight: 800 }}>
              Confirmar 15:00 →
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: S.dim }}>
              Cancelamento grátis até 2h antes
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Seletor de dia: scroll horizontal, 7 dias a partir de hoje<br/>
          • Grid de horários: 2 colunas, slots baseados na duração do serviço<br/>
          • Estados: disponível, indisponível (opaco), selecionado (preenchido)<br/>
          • Horários indisponíveis não são clicáveis<br/>
          • CTA só ativa quando horário está selecionado<br/>
          • Resumo: serviço + preço + duração + profissional<br/>
          • Política de cancelamento visível antes da confirmação<br/>
          • Se barbeiro tem múltiplos profissionais: seletor de profissional acima dos horários
        </div>
      </div>
    </div>
  );
}
