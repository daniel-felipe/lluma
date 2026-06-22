export default function DashSetupServicos() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    accent: "#333333", note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right, bottom }) => (
    <div style={{ position: "absolute", top, left, right, bottom, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  const services = [
    { name: "Corte", price: "R$ 40", time: "30 min", active: true },
    { name: "Barba", price: "R$ 25", time: "20 min", active: true },
    { name: "Combo (Corte + Barba)", price: "R$ 55", time: "45 min", active: true },
    { name: "Sobrancelha", price: "R$ 15", time: "10 min", active: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 02 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Setup — Cadastro de Serviços</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ padding: 24, height: "calc(100% - 28px)", overflowY: "auto" }}>
          {/* Progress */}
          <div style={{ position: "relative", marginBottom: 4 }}>
            <Ann text="Indicador de progresso do onboarding" top={-16} left={0} />
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: S.text }} />
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: S.wire }} />
            </div>
            <div style={{ fontSize: 10, color: S.muted, fontWeight: 600, letterSpacing: 1 }}>PASSO 1 DE 2</div>
          </div>

          {/* Title */}
          <div style={{ position: "relative", marginBottom: 4, marginTop: 12 }}>
            <Ann text="Título da etapa" top={-14} right={0} />
            <div style={{ fontSize: 19, fontWeight: 800, color: S.text }}>Configure seus serviços</div>
          </div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 22 }}>Adicione o que você oferece. Pode editar depois.</div>

          {/* Service cards */}
          <div style={{ position: "relative" }}>
            <Ann text="Lista de serviços com toggle ativo/inativo" top={-16} left={0} />
          </div>
          {services.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: S.bg, border: `1.5px solid ${s.active ? S.border : S.wire}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, opacity: s.active ? 1 : 0.5 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{s.price} · {s.time}</div>
              </div>
              <div style={{ position: "relative" }}>
                {i === 0 && <Ann text="Toggle on/off" top={-18} right={0} />}
                <div style={{ width: 38, height: 20, borderRadius: 10, background: s.active ? S.text : S.wire, position: "relative" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FFF", position: "absolute", top: 3, left: s.active ? 21 : 3 }} />
                </div>
              </div>
            </div>
          ))}

          {/* Add service */}
          <div style={{ position: "relative", marginTop: 4 }}>
            <Ann text="Botão adicionar — abre modal/form" top={-16} right={0} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px dashed ${S.border}`, borderRadius: 10, padding: 14, color: S.muted, fontSize: 12, fontWeight: 600 }}>
              + Adicionar serviço
            </div>
          </div>

          {/* CTA */}
          <div style={{ position: "relative", marginTop: 28 }}>
            <Ann text="CTA avança para passo 2" top={-16} right={0} />
            <div style={{ width: "100%", background: S.text, color: S.bg, borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              Próximo →
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Cada serviço tem: nome, preço (R$), duração (min), toggle ativo<br/>
          • Toggle desativado = serviço não aparece pro cliente<br/>
          • "Adicionar serviço" abre form inline ou modal com campos: nome, preço, duração<br/>
          • Serviços podem ser reordenados por drag (futuro)<br/>
          • Mínimo 1 serviço ativo para avançar
        </div>
      </div>
    </div>
  );
}
