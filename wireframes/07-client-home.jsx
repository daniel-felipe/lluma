export default function ClientHome() {
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

  const barbers = [
    { name: "Lucas Barber", rating: "4.9", reviews: 87, dist: "800m", services: "Corte · Barba · Combo", open: true },
    { name: "Barbearia do Chico", rating: "4.7", reviews: 52, dist: "1.2km", services: "Corte · Barba", open: true },
    { name: "Studio Black", rating: "4.8", reviews: 34, dist: "2.1km", services: "Corte · Barba · Design", open: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>App Cliente · Tela 01 / 04</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Home — Busca de Barbearias</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ padding: 20, height: "calc(100% - 28px)", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ position: "relative", marginBottom: 4 }}>
            <Ann text="Logo + saudação ao usuário" top={-16} left={0} />
            <div style={{ fontSize: 22, fontWeight: 900, color: S.text }}>BarberPro</div>
          </div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 20 }}>Encontre sua barbearia e agende em segundos.</div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Ann text="Campo de busca — nome ou endereço" top={-16} left={0} />
            <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, color: S.dim, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>🔍</span> Buscar barbearia...
            </div>
          </div>

          {/* Quick filters */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Ann text="Filtros rápidos (opcional)" top={-16} right={0} />
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {["Perto de mim", "Melhor avaliação", "Aberto agora"].map((f, i) => (
                <div key={i} style={{ background: i === 0 ? S.text : S.bg, color: i === 0 ? S.bg : S.muted, border: `1.5px solid ${i === 0 ? S.text : S.border}`, borderRadius: 20, padding: "6px 12px", fontSize: 10, fontWeight: 700 }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Section */}
          <div style={{ position: "relative" }}>
            <Ann text="Lista de resultados — ordenada por proximidade" top={-16} left={0} />
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Perto de você</div>
          </div>

          {/* Barber cards */}
          {barbers.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 14, padding: 14, marginBottom: 10, position: "relative" }}>
              {i === 0 && <Ann text="Card da barbearia — tap abre perfil (tela 02)" top={-18} right={0} />}
              {/* Avatar placeholder */}
              <div style={{ width: 52, height: 52, borderRadius: 12, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✂️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: S.text }}>{b.name}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.services}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#F9A825", fontWeight: 800 }}>★ {b.rating}</span>
                  <span style={{ fontSize: 10, color: S.dim }}>({b.reviews})</span>
                  <span style={{ fontSize: 10, color: S.dim }}>· {b.dist}</span>
                  {b.open && <span style={{ fontSize: 9, color: S.green, fontWeight: 700 }}>● Aberto</span>}
                  {!b.open && <span style={{ fontSize: 9, color: S.dim, fontWeight: 600 }}>● Fechado</span>}
                </div>
              </div>
              <div style={{ color: S.dim, fontSize: 20, flexShrink: 0 }}>›</div>
            </div>
          ))}

          {/* Recent */}
          <div style={{ position: "relative", marginTop: 20 }}>
            <Ann text="Seção 'Seus favoritos' — atalho para reagendar" top={-16} left={0} />
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Seus favoritos</div>
            <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✂️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Lucas Barber</div>
                <div style={{ fontSize: 10, color: S.muted }}>Último corte: 12 Mar</div>
              </div>
              <div style={{ background: S.text, color: S.bg, padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>Agendar</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Acesso principal: via link direto (sem precisar do app/busca)<br/>
          • Busca por nome ou localização<br/>
          • Filtros: proximidade, avaliação, aberto agora<br/>
          • Card mostra: foto/logo, nome, serviços, nota, distância, status<br/>
          • Seção "Favoritos" aparece se o cliente já agendou antes<br/>
          • Não exige cadastro para navegar — só para confirmar agendamento<br/>
          • Geolocalização para ordenar por proximidade
        </div>
      </div>
    </div>
  );
}
