export default function ClientPerfil() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    green: "#2E7D32",
    note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right }) => (
    <div style={{ position: "absolute", top, left, right, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  const services = [
    { name: "Corte", price: "R$ 40", time: "30 min" },
    { name: "Barba", price: "R$ 25", time: "20 min" },
    { name: "Combo (Corte + Barba)", price: "R$ 55", time: "45 min" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>App Cliente · Tela 02 / 04</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Perfil da Barbearia</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ height: "calc(100% - 28px)", overflowY: "auto" }}>
          {/* Cover + Profile */}
          <div style={{ position: "relative" }}>
            <Ann text="Área do perfil — foto, nome, info" top={4} right={8} />
            <div style={{ height: 100, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 10, color: S.muted }}>FOTO DE CAPA / GALERIA</div>
            </div>
            <div style={{ padding: "0 20px", marginTop: -24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: S.border, border: `3px solid ${S.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✂️</div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 19, fontWeight: 900, color: S.text }}>Lucas Barber</div>
                  <div style={{ fontSize: 11, color: S.muted }}>Rua das Flores, 123 · Centro</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info row */}
          <div style={{ padding: "12px 20px 0", position: "relative" }}>
            <Ann text="Dados rápidos — avaliação, status, horário" top={-4} left={20} />
            <div style={{ display: "flex", gap: 16, marginTop: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#F9A825", fontWeight: 800 }}>★ 4.9</span>
                <span style={{ fontSize: 10, color: S.dim }}>(87)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: S.green, fontWeight: 700 }}>● Aberto agora</span>
              </div>
              <div style={{ fontSize: 10, color: S.muted }}>Fecha às 19h</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: "0 20px", position: "relative" }}>
            <Ann text="Ações rápidas" top={-16} left={0} />
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { icon: "📍", label: "Mapa" },
                { icon: "📞", label: "Ligar" },
                { icon: "💬", label: "WhatsApp" },
              ].map((a, i) => (
                <div key={i} style={{ flex: 1, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{a.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: S.muted }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={{ padding: "0 20px 24px", position: "relative" }}>
            <Ann text="Lista de serviços — tap seleciona → vai para tela 03" top={-4} left={0} />
            <div style={{ fontSize: 14, fontWeight: 800, color: S.text, marginBottom: 12, marginTop: 8 }}>Escolha o serviço</div>

            {services.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 8, position: "relative" }}>
                {i === 0 && <Ann text="Card de serviço: nome, duração, preço" top={-18} right={0} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>⏱ {s.time}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: S.text }}>{s.price}</span>
                  <span style={{ color: S.dim, fontSize: 20 }}>›</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews preview */}
          <div style={{ padding: "0 20px 24px", position: "relative" }}>
            <Ann text="Preview de avaliações recentes" top={-4} left={0} />
            <div style={{ fontSize: 14, fontWeight: 800, color: S.text, marginBottom: 10, marginTop: 4 }}>Avaliações recentes</div>
            <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: S.wire }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.text }}>Rafael M.</div>
                  <div style={{ fontSize: 10, color: "#F9A825" }}>★★★★★</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 9, color: S.dim }}>há 3 dias</div>
              </div>
              <div style={{ fontSize: 11, color: S.muted, lineHeight: 1.5 }}>Atendimento top, sempre pontual. Recomendo!</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Foto de capa + avatar da barbearia<br/>
          • Info: nome, endereço, avaliação, status (aberto/fechado), horário<br/>
          • Ações rápidas: abrir no mapa, ligar, WhatsApp<br/>
          • Lista de serviços com preço e duração — tap leva para seleção de horário<br/>
          • Preview de avaliações (1-2 recentes) + "Ver todas"<br/>
          • Esta tela também é acessada diretamente via link (barberpro.app/lucas-barber)
        </div>
      </div>
    </div>
  );
}
