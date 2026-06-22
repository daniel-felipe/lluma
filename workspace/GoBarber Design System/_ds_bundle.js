/* @ds-bundle: {"format":3,"namespace":"GoBarberDesignSystem_019df2","components":[],"sourceHashes":{"ui_kits/barber/BarberScreens.jsx":"d92df8a95766","ui_kits/client/ClientScreens.jsx":"d6ce23e09c77","ui_kits/shared/Primitives.jsx":"b997fbf1b49f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GoBarberDesignSystem_019df2 = window.GoBarberDesignSystem_019df2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/barber/BarberScreens.jsx
try { (() => {
/* @jsx React.createElement */
// Barber dashboard screens

const HeroToday = ({
  earnings,
  bookings
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--ink-900)",
    color: "var(--bone-50)",
    padding: "20px 20px 28px",
    borderRadius: "0 0 24px 24px",
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  }
}, /*#__PURE__*/React.createElement(Eyebrow, {
  style: {
    color: "var(--bone-400)"
  }
}, "Saturday \xB7 Apr 12"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  style: iconBtnDark
}, /*#__PURE__*/React.createElement(I.search, null)), /*#__PURE__*/React.createElement("button", {
  style: iconBtnDark
}, /*#__PURE__*/React.createElement(I.bell, null)))), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 32,
    letterSpacing: "-0.02em"
  }
}, "Morning, Marcus."), /*#__PURE__*/React.createElement("div", {
  style: {
    color: "var(--bone-300)",
    fontSize: 15,
    marginTop: 4
  }
}, "6 on the books today."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 22
  }
}, /*#__PURE__*/React.createElement("div", {
  style: statTile
}, /*#__PURE__*/React.createElement(Eyebrow, {
  style: {
    color: "var(--bone-400)"
  }
}, "Today's take"), /*#__PURE__*/React.createElement("div", {
  style: statBig
}, "$", earnings)), /*#__PURE__*/React.createElement("div", {
  style: statTile
}, /*#__PURE__*/React.createElement(Eyebrow, {
  style: {
    color: "var(--bone-400)"
  }
}, "Booked"), /*#__PURE__*/React.createElement("div", {
  style: statBig
}, bookings, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--bone-400)",
    fontSize: 18
  }
}, " / 8")))));
const iconBtnDark = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "var(--ink-800)",
  border: "1px solid var(--ink-700)",
  color: "var(--bone-50)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer"
};
const statTile = {
  background: "var(--ink-800)",
  border: "1px solid var(--ink-700)",
  borderRadius: 12,
  padding: "12px 14px"
};
const statBig = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 26,
  letterSpacing: "-0.02em",
  color: "var(--bone-50)",
  marginTop: 4,
  fontVariantNumeric: "tabular-nums"
};
const BookingRow = ({
  b,
  active,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onClick,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: active ? "var(--amber-50)" : "var(--bg-surface)",
    border: `1px solid ${active ? "var(--amber-200)" : "var(--bone-200)"}`,
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: active ? "var(--shadow-2)" : "var(--shadow-1)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 56,
    textAlign: "right",
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 16,
    color: "var(--ink-900)",
    fontVariantNumeric: "tabular-nums"
  }
}, b.time), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--fg-3)"
  }
}, b.dur, "m")), /*#__PURE__*/React.createElement(Avatar, {
  initials: b.initials,
  size: 40,
  tone: b.tone || "ink"
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 16,
    color: "var(--ink-900)",
    letterSpacing: "-0.01em"
  }
}, b.name), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--fg-3)",
    marginTop: 2
  }
}, b.service)), b.status && /*#__PURE__*/React.createElement(Pill, {
  tone: b.status
}, b.statusLabel));
const TabBar = ({
  tab,
  setTab
}) => {
  const items = [{
    id: "today",
    label: "Today",
    icon: I.calendar
  }, {
    id: "clients",
    label: "Clients",
    icon: I.users
  }, {
    id: "earnings",
    label: "Earnings",
    icon: I.money
  }, {
    id: "settings",
    label: "Settings",
    icon: I.settings
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--bone-200)",
      background: "var(--bg-surface)",
      padding: "8px 8px 20px",
      display: "flex",
      justifyContent: "space-around",
      flexShrink: 0
    }
  }, items.map(it => {
    const active = tab === it.id;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => setTab(it.id),
      style: {
        appearance: "none",
        background: "transparent",
        border: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "6px 12px",
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--fg-3)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement(it.icon, {
      size: 22
    }), it.label);
  }));
};
const TodayScreen = ({
  bookings,
  onPick
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    flex: 1
  }
}, /*#__PURE__*/React.createElement(HeroToday, {
  earnings: "285",
  bookings: bookings.filter(b => b.status === "ok").length
}), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "20px 16px 16px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement(Eyebrow, null, "On the books"), /*#__PURE__*/React.createElement("button", {
  style: {
    appearance: "none",
    background: "transparent",
    border: "none",
    color: "var(--accent)",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer"
  }
}, "View week")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, bookings.map((b, i) => /*#__PURE__*/React.createElement(BookingRow, {
  key: i,
  b: b,
  active: b.active,
  onClick: () => onPick(b)
})))));
const ClientsScreen = () => {
  const list = [{
    name: "Marcus Reyes",
    last: "3 weeks ago",
    visits: 14,
    tone: "ink",
    initials: "MR"
  }, {
    name: "Jamal Torres",
    last: "Last week",
    visits: 8,
    tone: "amber",
    initials: "JT"
  }, {
    name: "Sam Kim",
    last: "2 days ago",
    visits: 22,
    tone: "bone",
    initials: "SK"
  }, {
    name: "Diego Alvarez",
    last: "Today",
    visits: 5,
    tone: "ink",
    initials: "DA"
  }, {
    name: "Theo Brennan",
    last: "1 month ago",
    visits: 11,
    tone: "amber",
    initials: "TB"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bone-50)",
      flex: 1,
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      marginBottom: 12
    }
  }, "Clients"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Search by name or phone",
    style: {
      width: "100%",
      padding: "12px 14px 12px 40px",
      border: "1px solid var(--bone-300)",
      borderRadius: 8,
      background: "var(--bg-surface)",
      fontSize: 15,
      fontFamily: "var(--font-body)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 12,
      top: 12,
      color: "var(--fg-4)"
    }
  }, /*#__PURE__*/React.createElement(I.search, null))), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Regulars"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, list.map((c, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: c.initials,
    tone: c.tone,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 16,
      color: "var(--ink-900)"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--fg-3)",
      marginTop: 2
    }
  }, "Last visit ", c.last, " \xB7 ", c.visits, " cuts")), /*#__PURE__*/React.createElement(I.arrowR, null)))));
};
const EarningsScreen = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    flex: 1,
    padding: "16px"
  }
}, /*#__PURE__*/React.createElement("h1", {
  style: {
    marginBottom: 16
  }
}, "Earnings"), /*#__PURE__*/React.createElement(Card, {
  style: {
    padding: 20,
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement(Eyebrow, null, "This week"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 40,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums"
  }
}, "$1,640"), /*#__PURE__*/React.createElement("div", {
  style: {
    color: "var(--green-500)",
    fontWeight: 600,
    fontSize: 14
  }
}, "+12%")), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 16,
    display: "flex",
    gap: 4,
    alignItems: "flex-end",
    height: 80
  }
}, [40, 65, 50, 70, 90, 55, 75].map((h, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    flex: 1,
    height: `${h}%`,
    background: i === 4 ? "var(--amber-500)" : "var(--ink-900)",
    borderRadius: 4
  }
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--fg-4)"
  }
}, /*#__PURE__*/React.createElement("span", null, "M"), /*#__PURE__*/React.createElement("span", null, "T"), /*#__PURE__*/React.createElement("span", null, "W"), /*#__PURE__*/React.createElement("span", null, "T"), /*#__PURE__*/React.createElement("span", null, "F"), /*#__PURE__*/React.createElement("span", null, "S"), /*#__PURE__*/React.createElement("span", null, "S"))), /*#__PURE__*/React.createElement(Eyebrow, {
  style: {
    marginTop: 12,
    marginBottom: 8
  }
}, "Recent"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  }
}, [{
  who: "Sam Kim",
  svc: "Cut + beard",
  amt: 55,
  time: "Today · 11:30am"
}, {
  who: "Jamal Torres",
  svc: "Skin fade",
  amt: 40,
  time: "Today · 10:00am"
}, {
  who: "Diego Alvarez",
  svc: "Cut",
  amt: 35,
  time: "Yesterday · 6pm"
}].map((r, i) => /*#__PURE__*/React.createElement(Card, {
  key: i,
  style: {
    display: "flex",
    alignItems: "center",
    padding: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 600,
    fontSize: 15
  }
}, r.who), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--fg-3)",
    marginTop: 2
  }
}, r.svc, " \xB7 ", r.time)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 18,
    fontVariantNumeric: "tabular-nums"
  }
}, "$", r.amt)))));
const BookingDetailSheet = ({
  b,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    background: "rgba(14,13,11,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    animation: "fadeIn 200ms var(--ease-out)"
  },
  onClick: onClose
}, /*#__PURE__*/React.createElement("div", {
  onClick: e => e.stopPropagation(),
  style: {
    background: "var(--bg-surface)",
    borderRadius: "16px 16px 0 0",
    padding: "20px 20px 28px",
    animation: "slideUp 320ms var(--ease-out)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: "var(--bone-300)",
    margin: "0 auto 16px"
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement(Avatar, {
  initials: b.initials,
  tone: b.tone || "ink",
  size: 48
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 20
  }
}, b.name), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--fg-3)"
  }
}, "Regular \xB7 14 cuts with you")), /*#__PURE__*/React.createElement("button", {
  onClick: onClose,
  style: {
    ...iconBtnDark,
    background: "var(--bone-100)",
    borderColor: "var(--bone-200)",
    color: "var(--ink-900)"
  }
}, /*#__PURE__*/React.createElement(I.x, null))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    borderRadius: 12,
    padding: 14
  }
}, /*#__PURE__*/React.createElement(Eyebrow, null, "Time"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 18,
    marginTop: 4,
    fontVariantNumeric: "tabular-nums"
  }
}, b.time), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--fg-3)"
  }
}, b.dur, " min")), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    borderRadius: 12,
    padding: 14
  }
}, /*#__PURE__*/React.createElement(Eyebrow, null, "Service"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 18,
    marginTop: 4
  }
}, "$", b.price || 45), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: "var(--fg-3)"
  }
}, b.service))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement(Eyebrow, null, "Notes"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 14,
    marginTop: 6,
    color: "var(--fg-2)"
  }
}, "Tighter on the sides than last time. Keep the top length.")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "secondary",
  fullWidth: true
}, "Reschedule"), /*#__PURE__*/React.createElement(Button, {
  variant: "dark",
  fullWidth: true,
  icon: /*#__PURE__*/React.createElement(I.message, {
    size: 18
  })
}, "Message"))));
Object.assign(window, {
  TodayScreen,
  ClientsScreen,
  EarningsScreen,
  BookingDetailSheet,
  TabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/barber/BarberScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/client/ClientScreens.jsx
try { (() => {
/* @jsx React.createElement */
// Client booking flow screens

const ClientHero = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--ink-900)",
    color: "var(--bone-50)",
    padding: "20px 20px 24px",
    borderRadius: "0 0 24px 24px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 8
  }
}, /*#__PURE__*/React.createElement(I.pin, null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: "var(--bone-400)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 600
  }
}, "Near you"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 14,
    fontWeight: 600
  }
}, "Brooklyn, NY"))), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "var(--amber-500)",
    color: "#FFF",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 14
  }
}, "AT")), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 28,
    letterSpacing: "-0.02em",
    lineHeight: 1.1
  }
}, "Book a chair.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--bone-400)"
  }
}, "Skip the wait.")), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    marginTop: 20
  }
}, /*#__PURE__*/React.createElement("input", {
  placeholder: "Search barbers, services",
  style: {
    width: "100%",
    padding: "14px 14px 14px 42px",
    border: "none",
    borderRadius: 10,
    background: "var(--bone-50)",
    fontSize: 15,
    fontFamily: "var(--font-body)",
    color: "var(--ink-900)"
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    left: 14,
    top: 14,
    color: "var(--fg-3)"
  }
}, /*#__PURE__*/React.createElement(I.search, null))));
const BarberCard = ({
  b,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onClick,
  style: {
    background: "var(--bg-surface)",
    border: "1px solid var(--bone-200)",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "var(--shadow-1)",
    cursor: "pointer"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 120,
    background: b.bg,
    position: "relative",
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 48,
    color: b.fg,
    letterSpacing: "-0.04em"
  }
}, b.initials), b.next && /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(14,13,11,0.7)",
    backdropFilter: "blur(8px)",
    color: "#FAF7F2",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 999,
    fontFamily: "var(--font-mono)"
  }
}, "Next: ", b.next)), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 16,
    color: "var(--ink-900)"
  }
}, b.name), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 13,
    color: "var(--ink-900)",
    fontWeight: 600
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--amber-500)"
  }
}, /*#__PURE__*/React.createElement(I.star, {
  size: 14,
  fill: "currentColor"
})), b.rating)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--fg-3)",
    marginTop: 2
  }
}, b.shop, " \xB7 ", b.dist), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--ink-900)",
    marginTop: 8,
    fontFamily: "var(--font-mono)"
  }
}, "From $", b.from)));
const HomeScreen = ({
  barbers,
  onPick
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    flex: 1
  }
}, /*#__PURE__*/React.createElement(ClientHero, null), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "20px 16px 16px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    overflow: "auto",
    marginBottom: 16,
    paddingBottom: 4
  }
}, ["All", "Fades", "Beards", "Lineups", "Color"].map((c, i) => /*#__PURE__*/React.createElement("button", {
  key: c,
  style: {
    appearance: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    padding: "8px 14px",
    borderRadius: 999,
    border: i === 0 ? "1px solid var(--ink-900)" : "1px solid var(--bone-300)",
    background: i === 0 ? "var(--ink-900)" : "var(--bg-surface)",
    color: i === 0 ? "var(--bone-50)" : "var(--ink-900)",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "var(--font-body)",
    cursor: "pointer"
  }
}, c))), /*#__PURE__*/React.createElement(Eyebrow, {
  style: {
    marginBottom: 10
  }
}, "Top barbers nearby"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  }
}, barbers.map((b, i) => /*#__PURE__*/React.createElement(BarberCard, {
  key: i,
  b: b,
  onClick: () => onPick(b)
})))));
const TimeSlot = ({
  time,
  active,
  taken,
  onClick
}) => /*#__PURE__*/React.createElement("button", {
  disabled: taken,
  onClick: onClick,
  style: {
    appearance: "none",
    padding: "10px 6px",
    borderRadius: 8,
    border: `1px solid ${active ? "var(--ink-900)" : "var(--bone-300)"}`,
    background: active ? "var(--ink-900)" : taken ? "var(--bone-100)" : "var(--bg-surface)",
    color: active ? "var(--bone-50)" : taken ? "var(--fg-4)" : "var(--ink-900)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    cursor: taken ? "not-allowed" : "pointer",
    textDecoration: taken ? "line-through" : "none",
    fontVariantNumeric: "tabular-nums"
  }
}, time);
const BookingScreen = ({
  b,
  onBack,
  onConfirm
}) => {
  const [svc, setSvc] = React.useState(0);
  const [time, setTime] = React.useState("2:30pm");
  const services = [{
    name: "Cut",
    dur: 30,
    price: 35
  }, {
    name: "Cut + beard",
    dur: 45,
    price: 55
  }, {
    name: "Skin fade",
    dur: 30,
    price: 40
  }, {
    name: "Lineup",
    dur: 15,
    price: 20
  }];
  const slots = [{
    t: "12:00pm",
    taken: true
  }, {
    t: "12:30pm",
    taken: true
  }, {
    t: "1:00pm",
    taken: false
  }, {
    t: "1:30pm",
    taken: false
  }, {
    t: "2:00pm",
    taken: true
  }, {
    t: "2:30pm",
    taken: false
  }, {
    t: "3:00pm",
    taken: false
  }, {
    t: "3:30pm",
    taken: false
  }, {
    t: "4:00pm",
    taken: true
  }, {
    t: "4:30pm",
    taken: false
  }];
  const chosen = services[svc];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bone-50)",
      flex: 1,
      position: "relative",
      paddingBottom: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 240,
      background: b.bg,
      position: "relative",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 96,
      color: b.fg,
      letterSpacing: "-0.04em"
    }
  }, b.initials), /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 999,
      background: "rgba(14,13,11,0.7)",
      backdropFilter: "blur(8px)",
      color: "#FAF7F2",
      border: "none",
      cursor: "pointer",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(I.arrowL, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 16px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, b.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 14,
      fontWeight: 600,
      whiteSpace: "nowrap",
      paddingTop: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--amber-500)"
    }
  }, /*#__PURE__*/React.createElement(I.star, {
    size: 16,
    fill: "currentColor"
  })), b.rating, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-3)",
      fontWeight: 400
    }
  }, "(", b.reviews, ")"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--fg-3)",
      marginBottom: 20
    }
  }, b.shop, " \xB7 ", b.dist), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 10
    }
  }, "Service"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 24
    }
  }, services.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setSvc(i),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      border: `1px solid ${svc === i ? "var(--ink-900)" : "var(--bone-200)"}`,
      borderRadius: 12,
      background: svc === i ? "var(--ink-900)" : "var(--bg-surface)",
      color: svc === i ? "var(--bone-50)" : "var(--ink-900)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 999,
      border: `2px solid ${svc === i ? "var(--bone-50)" : "var(--bone-300)"}`,
      display: "grid",
      placeItems: "center"
    }
  }, svc === i && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "var(--bone-50)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 15
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 2
    }
  }, s.dur, " min")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 18,
      fontVariantNumeric: "tabular-nums"
    }
  }, "$", s.price)))), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 10
    }
  }, "Saturday, Apr 12"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8
    }
  }, slots.map((s, i) => /*#__PURE__*/React.createElement(TimeSlot, {
    key: i,
    time: s.t,
    taken: s.taken,
    active: time === s.t && !s.taken,
    onClick: () => setTime(s.t)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--bone-200)",
      padding: "14px 16px 28px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-3)"
    }
  }, chosen.name, " \xB7 ", time), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 22,
      fontVariantNumeric: "tabular-nums"
    }
  }, "$", chosen.price)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => onConfirm({
      b,
      svc: chosen,
      time
    })
  }, "Book chair")));
};
const ConfirmedScreen = ({
  booking,
  onDone
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bone-50)",
    flex: 1,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 72,
    height: 72,
    borderRadius: 999,
    background: "var(--green-500)",
    color: "#FFF",
    display: "grid",
    placeItems: "center",
    marginBottom: 24
  }
}, /*#__PURE__*/React.createElement(I.check, {
  size: 36
})), /*#__PURE__*/React.createElement("h1", {
  style: {
    fontSize: 28,
    marginBottom: 8
  }
}, "You're booked."), /*#__PURE__*/React.createElement("p", {
  style: {
    color: "var(--fg-2)",
    fontSize: 15,
    marginBottom: 28,
    maxWidth: 280
  }
}, booking.b.name, " will see you at ", booking.time, " for a ", booking.svc.name.toLowerCase(), "."), /*#__PURE__*/React.createElement(Card, {
  style: {
    width: "100%",
    padding: 18,
    textAlign: "left"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--fg-3)",
    fontSize: 13
  }
}, "Booking"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: "var(--font-mono)",
    fontSize: 13
  }
}, "BK-9X42T")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--fg-3)",
    fontSize: 13
  }
}, "When"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 600,
    fontSize: 14
  }
}, "Sat, Apr 12 \xB7 ", booking.time)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--fg-3)",
    fontSize: 13
  }
}, "Where"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 600,
    fontSize: 14
  }
}, booking.b.shop)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTop: "1px solid var(--bone-200)"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--fg-3)",
    fontSize: 13
  }
}, "Total"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 18,
    fontVariantNumeric: "tabular-nums"
  }
}, "$", booking.svc.price))), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 24,
    display: "flex",
    gap: 8,
    width: "100%"
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "secondary",
  fullWidth: true
}, "Add to calendar"), /*#__PURE__*/React.createElement(Button, {
  variant: "dark",
  fullWidth: true,
  onClick: onDone
}, "Done")));
Object.assign(window, {
  HomeScreen,
  BookingScreen,
  ConfirmedScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/client/ClientScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/shared/Primitives.jsx
try { (() => {
/* @jsx React.createElement */
// Shared UI primitives for both barber + client kits.
// Drop into window for cross-script use.

const Avatar = ({
  initials,
  size = 40,
  tone = "ink",
  status
}) => {
  const tones = {
    ink: {
      bg: "var(--ink-900)",
      fg: "var(--bone-50)"
    },
    amber: {
      bg: "var(--amber-500)",
      fg: "#FFF"
    },
    bone: {
      bg: "var(--bone-100)",
      fg: "var(--ink-900)",
      border: "1px solid var(--bone-200)"
    }
  };
  const t = tones[tone] || tones.ink;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 999,
      background: t.bg,
      color: t.fg,
      border: t.border,
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: size * 0.36,
      letterSpacing: "-0.02em",
      flexShrink: 0,
      position: "relative"
    }
  }, initials, status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: -1,
      bottom: -1,
      width: size * 0.32,
      height: size * 0.32,
      borderRadius: 999,
      border: "2px solid var(--bg-surface)",
      background: status === "ok" ? "var(--green-500)" : status === "pending" ? "var(--amber-400)" : "var(--bone-400)"
    }
  }));
};
const Pill = ({
  tone = "neutral",
  children
}) => {
  const tones = {
    ok: {
      bg: "#E0EBDA",
      fg: "#2F4A2C",
      dot: "#4F7A4A"
    },
    pending: {
      bg: "#FBF1E6",
      fg: "#6B3D10",
      dot: "#D98B2F"
    },
    danger: {
      bg: "#F4DDD5",
      fg: "#6E2A19",
      dot: "#B5462E"
    },
    info: {
      bg: "#DCE4EE",
      fg: "#25395B",
      dot: "#3D5A7A"
    },
    neutral: {
      bg: "var(--bone-100)",
      fg: "var(--ink-900)",
      dot: "var(--bone-500)"
    }
  };
  const t = tones[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      background: t.bg,
      color: t.fg,
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: "0.02em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: t.dot
    }
  }), children);
};
const Button = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  style,
  type = "button",
  icon,
  fullWidth
}) => {
  const variants = {
    primary: {
      bg: "var(--amber-500)",
      fg: "#FFF",
      border: "transparent",
      hover: "var(--amber-600)"
    },
    dark: {
      bg: "var(--ink-900)",
      fg: "var(--bone-50)",
      border: "transparent",
      hover: "var(--ink-800)"
    },
    secondary: {
      bg: "#FFF",
      fg: "var(--ink-900)",
      border: "var(--bone-300)",
      hover: "var(--bone-100)"
    },
    ghost: {
      bg: "transparent",
      fg: "var(--ink-900)",
      border: "transparent",
      hover: "var(--bone-100)"
    },
    danger: {
      bg: "var(--red-500)",
      fg: "#FFF",
      border: "transparent",
      hover: "#9A3925"
    }
  };
  const sizes = {
    sm: {
      px: 12,
      py: 8,
      fs: 13
    },
    md: {
      px: 18,
      py: 12,
      fs: 15
    },
    lg: {
      px: 22,
      py: 16,
      fs: 16
    }
  };
  const v = variants[variant],
    s = sizes[size];
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    onTouchStart: () => setPress(true),
    onTouchEnd: () => setPress(false),
    style: {
      appearance: "none",
      cursor: "pointer",
      background: hover ? v.hover : v.bg,
      color: v.fg,
      border: `1px solid ${v.border === "transparent" ? "transparent" : `var(--bone-300)`}`,
      borderColor: v.border === "transparent" ? "transparent" : v.border,
      padding: `${s.py}px ${s.px}px`,
      borderRadius: 8,
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: s.fs,
      letterSpacing: "-0.01em",
      transform: press ? "scale(0.97)" : "scale(1)",
      transition: "background 120ms var(--ease-out), transform 120ms var(--ease-out)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: fullWidth ? "100%" : "auto",
      ...style
    }
  }, icon, children);
};
const Card = ({
  children,
  style,
  dark = false,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onClick,
  style: {
    background: dark ? "var(--ink-800)" : "var(--bg-surface)",
    border: `1px solid ${dark ? "var(--ink-700)" : "var(--bone-200)"}`,
    borderRadius: 12,
    padding: 16,
    boxShadow: dark ? "none" : "var(--shadow-1)",
    cursor: onClick ? "pointer" : "default",
    ...style
  }
}, children);
const Eyebrow = ({
  children,
  style
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--fg-3)",
    ...style
  }
}, children);

// Icons — inline Lucide-style 24x24, currentColor stroke.
const I = {
  calendar: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18"
  })),
  clock: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  user: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  })),
  users: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
  })),
  search: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  bell: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 21a2 2 0 0 0 4 0"
  })),
  money: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "22"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
  })),
  settings: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.14.7.36 1 .68"
  })),
  arrowR: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 5 19 12 12 19"
  })),
  arrowL: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "19",
    y1: "12",
    x2: "5",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 19 5 12 12 5"
  })),
  check: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  x: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  })),
  pin: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })),
  star: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: p?.fill || "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  })),
  home: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "9 22 9 12 15 12 15 22"
  })),
  plus: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })),
  more: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "1"
  })),
  message: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"
  })),
  scissors: p => /*#__PURE__*/React.createElement("svg", {
    width: p?.size || 20,
    height: p?.size || 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "18",
    r: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "4",
    x2: "8.12",
    y2: "15.88"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14.47",
    y1: "14.48",
    x2: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8.12",
    y1: "8.12",
    x2: "12",
    y2: "12"
  }))
};
const PhoneFrame = ({
  children,
  dark
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: 390,
    height: 800,
    borderRadius: 36,
    background: dark ? "var(--ink-900)" : "var(--bone-50)",
    border: "1px solid var(--ink-700)",
    overflow: "hidden",
    boxShadow: "var(--shadow-3)",
    position: "relative",
    display: "flex",
    flexDirection: "column"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 44,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 14,
    color: dark ? "var(--bone-50)" : "var(--ink-900)",
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "12",
  viewBox: "0 0 18 12",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("rect", {
  x: "0",
  y: "6",
  width: "3",
  height: "6",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "3",
  width: "3",
  height: "9",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  x: "10",
  y: "0",
  width: "3",
  height: "12",
  rx: "1"
})), /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "10",
  viewBox: "0 0 14 10",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1 4a8 8 0 0 1 12 0M3 6a5 5 0 0 1 8 0M5.5 8a2 2 0 0 1 3 0"
})), /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "11",
  viewBox: "0 0 22 11",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1"
}, /*#__PURE__*/React.createElement("rect", {
  x: "0.5",
  y: "0.5",
  width: "18",
  height: "10",
  rx: "2"
}), /*#__PURE__*/React.createElement("rect", {
  x: "2",
  y: "2",
  width: "15",
  height: "7",
  rx: "1",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "20",
  y: "3.5",
  width: "1.5",
  height: "4",
  rx: "0.5",
  fill: "currentColor"
})))), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column"
  }
}, children));
Object.assign(window, {
  Avatar,
  Pill,
  Button,
  Card,
  Eyebrow,
  I,
  PhoneFrame
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/shared/Primitives.jsx", error: String((e && e.message) || e) }); }

})();
