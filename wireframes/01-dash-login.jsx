export default function DashLogin() {
  const S = {
    bg: "#FAFAFA", wire: "#E0E0E0", border: "#D0D0D0",
    text: "#1A1A1A", muted: "#888888", dim: "#AAAAAA",
    accent: "#333333", note: "#4A90D9", noteBg: "#EBF3FD",
  };

  const Ann = ({ text, top, left, right }) => (
    <div style={{ position: "absolute", top, left, right, background: S.noteBg, border: `1px solid ${S.note}40`, borderRadius: 6, padding: "4px 8px", fontSize: 9, color: S.note, fontWeight: 600, zIndex: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
      <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: 3 }}>Dashboard · Tela 01 / 06</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text, margin: "0 0 24px" }}>Login do Barbeiro</h2>

      <div style={{ width: 360, height: 680, background: S.bg, borderRadius: 20, border: `2px solid ${S.border}`, overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {/* Status bar */}
        <div style={{ height: 28, background: S.wire, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: S.muted }}>STATUS BAR</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100% - 28px)", padding: "0 32px", position: "relative" }}>
          
          {/* Logo */}
          <div style={{ position: "relative", marginBottom: 6 }}>
            <Ann text="Logo principal — marca do produto" top={-20} left={-40} />
            <div style={{ fontSize: 26, fontWeight: 900, color: S.text, letterSpacing: -1 }}>BarberPro</div>
          </div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 44 }}>Painel do Profissional</div>

          {/* Form */}
          <div style={{ width: "100%", position: "relative" }}>
            <Ann text="Campo: telefone ou e-mail" top={-16} left={0} />
            <label style={{ fontSize: 10, color: S.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Telefone ou e-mail</label>
            <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "12px 14px", marginTop: 6, marginBottom: 20, color: S.dim, fontSize: 13 }}>
              (31) 99999-0000
            </div>

            <div style={{ position: "relative" }}>
              <Ann text="Campo: senha" top={-16} left={0} />
              <label style={{ fontSize: 10, color: S.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Senha</label>
              <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "12px 14px", marginTop: 6, marginBottom: 8, color: S.dim, fontSize: 13 }}>
                ••••••••
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: 28 }}>
              <span style={{ fontSize: 11, color: S.note, cursor: "pointer" }}>Esqueci minha senha</span>
            </div>

            <div style={{ position: "relative" }}>
              <Ann text="CTA principal — ação primária" top={-18} right={0} />
              <div style={{ width: "100%", background: S.text, color: S.bg, borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
                Entrar
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: S.muted, position: "relative" }}>
              <Ann text="Link de cadastro" top={-16} right={-20} />
              Não tem conta? <span style={{ color: S.text, fontWeight: 700, textDecoration: "underline" }}>Criar agora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div style={{ marginTop: 20, maxWidth: 360, width: "100%", background: S.noteBg, border: `1px solid ${S.note}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.note, marginBottom: 8 }}>📐 Especificações</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>
          • Tela centralizada verticalmente<br/>
          • Login via telefone (principal) ou e-mail<br/>
          • Autenticação: SMS com código ou senha<br/>
          • Link "Criar agora" leva ao fluxo de onboarding (tela 02)<br/>
          • Considerar login social futuro (Google)
        </div>
      </div>
    </div>
  );
}
