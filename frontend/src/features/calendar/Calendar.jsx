import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";

const TYPE_COLOR = {
  holiday: { bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
  exam: { bg: "#eff6ff", text: "#2563eb", dot: "#2563eb" },
  event: { bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
};

// keys into the dictionary, in calendar order
const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"];

export default function Calendar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t } = useTranslation();
  const isAdmin = (user.role || "").toLowerCase() === "admin";

  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("event");
  const [audience, setAudience] = useState("everyone");
  const [yearNum, setYearNum] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const showYear = audience === "students" || audience === "parents";

  const fetchEvents = () => {
    API.get("/calendar/")
      .then((res) => setEvents(res.data || []))
      .catch((err) => console.log("calendar error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async () => {
    if (!title.trim() || !startDate) {
      alert(t("enter_title_date"));
      return;
    }
    const payload = {
      title: title.trim(),
      event_type: type,
      audience: audience,
      year_number: showYear && yearNum ? parseInt(yearNum, 10) : null,
      start_date: startDate,
      end_date: endDate || null,
    };
    try {
      await API.post("/calendar/", payload);
      setTitle("");
      setStartDate("");
      setEndDate("");
      fetchEvents();
    } catch (err) {
      console.log("add error:", err);
      alert(t("could_not_add"));
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm(t("delete_entry_confirm"))) return;
    try {
      await API.delete(`/calendar/${id}/`);
      fetchEvents();
    } catch (err) {
      console.log("delete error:", err);
    }
  };

  const inRange = (dayStr, ev) => {
    const end = ev.end_date || ev.start_date;
    return dayStr >= ev.start_date && dayStr <= end;
  };

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
  };
  const goToday = () => {
    const d = new Date();
    setViewMonth(d.getMonth()); setViewYear(d.getFullYear());
  };

  // build calendar cells
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let n = 1; n <= daysInMonth; n++) cells.push(n);

  const pad = (x) => String(x).padStart(2, "0");

  const monthEvents = events.filter((ev) => {
    const parts = ev.start_date.split("-");
    return parseInt(parts[1], 10) - 1 === viewMonth && parseInt(parts[0], 10) === viewYear;
  });

  // translate the audience word shown in the entries list
  const audienceText = (a) => {
    const k = (a || "").toLowerCase();
    if (k === "everyone") return t("everyone");
    if (k === "teachers") return t("teachers");
    if (k === "students") return t("students");
    if (k === "parents") return t("parents");
    return a;
  };

  return (
    <div className="app">
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content">
            <div style={{ width: "100%", padding: "8px 4px" }}>

              <div style={{ marginBottom: 18 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: "#0f172a" }}>{t("academic_calendar_title")}</h1>
                <p style={{ color: "#64748b", fontSize: 15, marginTop: 4 }}>
                  {isAdmin ? t("calendar_admin_sub") : t("calendar_user_sub")}
                </p>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, marginBottom: 18 }}>
                <Legend color="#dc2626" label={t("holiday_leave")} />
                <Legend color="#2563eb" label={t("exam")} />
                <Legend color="#16a34a" label={t("event")} />
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: isAdmin ? "minmax(0,300px) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,260px)",
                gap: 20, alignItems: "start",
              }}>

                {/* LEFT: admin form OR upcoming list */}
                {isAdmin ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={cardStyle}>
                      <h3 style={h3Style}>{t("add_entry")}</h3>

                      <Label>{t("title")}</Label>
                      <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title_placeholder")} />

                      <Label>{t("type")}</Label>
                      <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="event">{t("event")}</option>
                        <option value="holiday">{t("holiday_leave")}</option>
                        <option value="exam">{t("exam")}</option>
                      </select>

                      <Label>{t("who_is_this_for")}</Label>
                      <select style={inputStyle} value={audience} onChange={(e) => setAudience(e.target.value)}>
                        <option value="everyone">{t("everyone")}</option>
                        <option value="teachers">{t("teachers")}</option>
                        <option value="students">{t("students")}</option>
                        <option value="parents">{t("parents")}</option>
                      </select>

                      {showYear && (
                        <>
                          <Label>{t("which_year")}</Label>
                          <select style={inputStyle} value={yearNum} onChange={(e) => setYearNum(e.target.value)}>
                            <option value="">{t("all_years")}</option>
                            <option value="1">{t("first_year")}</option>
                            <option value="2">{t("second_year")}</option>
                            <option value="3">{t("third_year")}</option>
                            <option value="4">{t("final_year")}</option>
                          </select>
                        </>
                      )}

                      <Label>{t("start_date")}</Label>
                      <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                      <Label>{t("end_date_optional")}</Label>
                      <input type="date" style={inputStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 1.5 }}>
                        {t("end_date_hint")}
                      </div>

                      <button onClick={addEvent} style={btnStyle}>{t("add_and_notify")}</button>
                    </div>

                    <div style={cardStyle}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t("this_months_entries")}</div>
                      {monthEvents.length === 0 ? (
                        <div style={{ color: "#94a3b8", fontSize: 13 }}>{t("no_entries_month")}</div>
                      ) : monthEvents.map((ev) => (
                        <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 2, background: (TYPE_COLOR[ev.event_type] || {}).dot }} />
                          <span style={{ flex: 1 }}>
                            {ev.title}
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                              {" · "}{audienceText(ev.audience)}{ev.year_number ? ` (${t("year")} ${ev.year_number})` : ""}
                            </span>
                          </span>
                          <button onClick={() => deleteEvent(ev.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>{t("delete")}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* CALENDAR */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <button onClick={prevMonth} style={{ ...navBtn, fontSize: 18, padding: "6px 16px", fontWeight: 700 }} aria-label="Previous month">‹</button>
                    <h3 style={{ ...h3Style, margin: 0 }}>{t(MONTH_KEYS[viewMonth])} {viewYear}</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={goToday} style={{ ...navBtn, background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}>{t("today")}</button>
                      <button onClick={nextMonth} style={{ ...navBtn, fontSize: 18, padding: "6px 16px", fontWeight: 700 }} aria-label="Next month">›</button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
                    {DAY_KEYS.map((d) => (
                      <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 600 }}>{t(d)}</div>
                    ))}
                  </div>

                  {loading ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>{t("loading")}</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                      {cells.map((n, idx) => {
                        if (n === null) return <div key={"e" + idx} style={{ minHeight: 74, background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: 8 }} />;
                        const dayStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(n)}`;
                        const dayEvents = events.filter((ev) => inRange(dayStr, ev));
                        return (
                          <div key={dayStr} style={{ minHeight: 74, border: "1px solid #e2e8f0", borderRadius: 8, padding: 6, fontSize: 13 }}>
                            <div style={{ fontWeight: 600, color: "#334155" }}>{n}</div>
                            {dayEvents.map((ev) => {
                              const c = TYPE_COLOR[ev.event_type] || TYPE_COLOR.event;
                              return (
                                <div key={ev.id} title={ev.title} style={{ marginTop: 4, fontSize: 10.5, padding: "2px 5px", borderRadius: 4, background: c.bg, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {ev.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RIGHT: upcoming (non-admin only) */}
                {!isAdmin && (
                  <div style={cardStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t("upcoming")}</div>
                    {events.length === 0 ? (
                      <div style={{ color: "#94a3b8", fontSize: 13 }}>{t("nothing_scheduled")}</div>
                    ) : events.slice(0, 8).map((ev) => (
                      <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: (TYPE_COLOR[ev.event_type] || {}).dot }} />
                        <span style={{ flex: 1 }}>{ev.title}</span>
                        <span style={{ color: "#64748b", fontSize: 12 }}>{ev.start_date.slice(8, 10)}/{ev.start_date.slice(5, 7)}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#475569" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5, marginTop: 12 }}>{children}</div>;
}

const cardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 22 };
const h3Style = { fontSize: 17, fontWeight: 700, marginBottom: 16, color: "#0f172a" };
const inputStyle = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 12px", fontSize: 14, background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const btnStyle = { width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 16 };
const navBtn = { border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, color: "#334155" };
