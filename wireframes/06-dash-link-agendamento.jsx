export default function DashLink() {
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

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 06 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Link de Agendamento</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ padding: 24, height: "calc(100% - 28px - 56px)", overflowY: "auto" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 4 }}>Seu link de agendamento</div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 24 }}>Compartilhe para seus clientes agendarem direto.</div>

          {/* Link box */}
          <div style={{ position: "relative" }}>
            <Ann text="URL personalizável + botão copiar" top={-16} left={0} />
            <div style={{ background: S.bg, border: `2px solid ${S.text}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: S.text, fontWeight: 700, fontFamily: "monospace" }}>barberpro.app/lucas-barber</div>
              <div style={{ background: S.text, color: S.bg, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Copiar</div>
            </div>
          </div>

          {/* Share options */}
          <div style={{ position: "relative" }}>
            <Ann text="Compartilhamento direto por canal" top={-16} left={0} />
            <div style={{ fontSize: 12, fontWeight: 700, color: S.text, marginBottom: 10 }}>Compartilhar via:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
              {[
                { name: "WhatsApp", icon: "💬", desc: "Status ou contato" },
                { name: "Instagram", icon: "📸", desc: "Link na bio" },
                { name: "Facebook", icon: "📘", desc: "Post ou página" },
                { name: "Copiar texto", icon: "📋", desc: "Mensagem pronta" },
              ].map((s, i) => (
                <div key={i} style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.text }}>{s.name}</div>
                  <div style={{ fontSize: 9, color: S.muted, marginTop: 2 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div style={{ position: "relative" }}>
            <Ann text="QR Code para imprimir e colar na barbearia" top={-16} left={0} />
            <div style={{ background: S.bg, borderRadius: 14, padding: 24, border: `1.5px dashed ${S.border}`, textAlign: "center" }}>
              <div style={{ width: 100, height: 100, background: S.wire, borderRadius: 8, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 2, width: 50 }}>
                  {Array(25).fill(0).map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, background: [0,1,2,4,5,6,10,12,14,18,20,22,23,24].includes(i) ? S.text : S.wire, borderRadius: 1 }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.text }}>QR Code</div>
              <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>Escaneie para agendar</div>
              <div style={{ marginTop: 12, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "8px 16px", display: "inline-block", fontSize: 11, fontWeight: 600, color: S.text }}>
                ↓ Baixar QR Code
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ position: "relative", marginTop: 24 }}>
            <Ann text="Métricas do link — conversão" top={-16} left={0} />
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Visitas ao link", value: "143" },
                { label: "Agendamentos", value: "38" },
                { label: "Conversão", value: "26%" },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "10px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: S.text }}>{m.value}</div>
                  <div style={{ fontSize: 9, color: S.muted, marginTop: 1 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: S.bg, borderTop: `1.5px solid ${S.wire}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          {[
            { label: "Hoje", icon: "📋", active: false },
            { label: "Semana", icon: "📅", active: false },
            { label: "Link", icon: "🔗", active: true },
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
          • URL slug personalizável (barberpro.app/nome-da-barbearia)<br/>
          • Compartilhamento: WhatsApp (manda mensagem pronta), Instagram (copia link), Facebook, texto genérico<br/>
          • QR Code gerado automaticamente — download em PNG para impressão<br/>
          • Métricas simples: visitas, agendamentos via link, taxa de conversão<br/>
          • "Copiar texto" gera mensagem pronta tipo: "Agende seu horário aqui: [link]"
        </div>
      </div>
    </div>
  );
}
