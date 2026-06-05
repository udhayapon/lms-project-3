import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../api";
import "../../App.css";

// ─── inline styles ────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  content: { padding: "28px 32px", maxWidth: 1100 },

  pageTitle:    { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },

  tabBar: {
    display: "flex",
    gap: 4,
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    width: "fit-content",
    marginTop: 20,
    marginBottom: 24,
  },
  tab: (active, color) => ({
    padding: "8px 22px",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all 0.2s",
    background: active ? color : "transparent",
    color: active ? "white" : "#64748b",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
  }),

  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 18 },

  filterRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 },
  input: {
    padding: "9px 11px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    background: "white",
    width: 150,
  },

  btnPrimary: (color = "#059669") => ({
    padding: "9px 22px",
    background: color,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  }),
  btnOutline: {
    padding: "9px 16px",
    background: "white",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  ruleNote: { fontSize: 12, color: "#64748b", marginBottom: 14 },

  tableWrap: { overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" },
  th: (center) => ({
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    textAlign: center ? "center" : "left",
    background: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    minWidth: center ? 70 : 110,
  }),
  td: (center) => ({
    padding: "10px 12px",
    fontSize: 13,
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    textAlign: center ? "center" : "left",
  }),

  // P / A / DL dot
  dot: (status) => {
    const map = {
      present:    { bg: "#dcfce7", color: "#15803d" },
      absent:     { bg: "#fee2e2", color: "#b91c1c" },
      duty_leave: { bg: "#fef3c7", color: "#b45309" },
    };
    const c = map[status] || { bg: "#f1f5f9", color: "#94a3b8" };
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: c.bg,
      color: c.color,
      fontWeight: 700,
      fontSize: 12,
    };
  },

  // holiday row
  holidayCell: {
    color: "#dc2626",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "left",
  },

  legend: {
    display: "flex",
    gap: 18,
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    color: "#475569",
  },

  // course-wise legend box
  legendBox: {
    fontSize: 12,
    color: "#64748b",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 1.9,
  },

  rollBadge: {
    display: "inline-block",
    padding: "2px 8px",
    background: "#f1f5f9",
    borderRadius: 5,
    fontSize: 12,
    color: "#475569",
    fontWeight: 600,
  },

  pctGood: { color: "#16a34a", fontWeight: 700 },
  pctBad:  { color: "#dc2626", fontWeight: 700 },
  lowRow:  { background: "#fff5f5" },

  empty: { color: "#94a3b8", fontSize: 14, padding: "20px 0" },
};

const DOT_LABEL = { present: "P", absent: "A", duty_leave: "DL" };
const HOURS     = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function AttendanceStudent() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("daily"); // "daily" | "coursewise"

  // ── daily state ────────────────────────────────────────────────────────────
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");
  const [dailyData, setDailyData]   = useState([]);
  const [dailyRaw, setDailyRaw]     = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  // ── coursewise state ───────────────────────────────────────────────────────
  const [cwFrom, setCwFrom]           = useState("");
  const [cwTo, setCwTo]               = useState("");
  const [courseReport, setCourseReport] = useState([]);
  const [cwLoading, setCwLoading]     = useState(false);

  // ── fetch daily ────────────────────────────────────────────────────────────
  const fetchDaily = async () => {
    if (!fromDate || !toDate) return alert("Please select both From Date and To Date.");
    setDailyLoading(true);
    try {
      const res  = await API.get(`/attendance/?from_date=${fromDate}&to_date=${toDate}`);
      const data = res.data?.results || res.data || [];
      setDailyRaw(data);

      // group: date → { hour: status }
      const grouped = {};
      data.forEach((a) => {
        if (!grouped[a.date]) grouped[a.date] = {};
        grouped[a.date][a.hour] = a.status;
      });

      const rows = Object.keys(grouped)
        .sort()
        .map((date) => ({ date, hours: grouped[date] }));

      setDailyData(rows);
    } catch {
      alert("Error fetching attendance. Please try again.");
    } finally {
      setDailyLoading(false);
    }
  };

  const resetDaily = () => {
    setFromDate(""); setToDate(""); setDailyData([]); setDailyRaw([]);
  };

  // ── fetch course-wise ──────────────────────────────────────────────────────
  const fetchCourseWise = async () => {
    if (!cwFrom || !cwTo) return alert("Please select both From Date and To Date.");
    setCwLoading(true);
    try {
      const res  = await API.get(`/attendance/?from_date=${cwFrom}&to_date=${cwTo}`);
      const data = res.data?.results || res.data || [];

      const subjectMap = {};
      data.forEach((a) => {
        const key = a.teaching_assignment;
        if (!subjectMap[key]) {
          subjectMap[key] = {
            subject: a.subject_name,
            course:  a.course_name,
            total: 0, present: 0, duty: 0,
          };
        }
        subjectMap[key].total++;
        if (a.status === "present")     subjectMap[key].present++;
        else if (a.status === "duty_leave") subjectMap[key].duty++;
      });

      setCourseReport(Object.values(subjectMap));
    } catch {
      alert("Error fetching report. Please try again.");
    } finally {
      setCwLoading(false);
    }
  };

  const resetCourseWise = () => {
    setCwFrom(""); setCwTo(""); setCourseReport([]);
  };

  // ── Print Daily Attendance ─────────────────────────────────────────────────
  const handlePrintDaily = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const hourHeaders = HOURS.map(h => `<th>Hour ${h}</th>`).join("");

    const rows = dailyData.map((row) => {
      const hasAny = Object.keys(row.hours).length > 0;
      if (!hasAny) {
        return `<tr>
          <td class="date-col" style="color:#dc2626">${fmtDate(row.date)}</td>
          <td colspan="10" style="text-align:center;color:#dc2626;font-style:italic">Holiday / No Classes</td>
        </tr>`;
      }
      const cells = HOURS.map(h => {
        const s = row.hours[h];
        if (s === "present")    return `<td class="p">P</td>`;
        if (s === "absent")     return `<td class="a">A</td>`;
        if (s === "duty_leave") return `<td class="dl">DL</td>`;
        return `<td class="dash">—</td>`;
      }).join("");
      return `<tr><td class="date-col">${fmtDate(row.date)}</td>${cells}</tr>`;
    }).join("");

    const html = `
      <html><head><title>Daily Attendance</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; padding: 30px; }
        .title { text-align:center; font-size:16px; font-weight:bold;
                 border:2px solid #000; padding:8px; border-bottom:none; }
        .info-table { width:100%; border-collapse:collapse; border:2px solid #000; border-top:none; }
        .info-table td { border:1px solid #000; padding:7px 10px; font-size:13px; }
        .rule { text-align:center; border:1px solid #000; border-top:none;
                padding:7px; font-size:13px; margin-bottom:12px; }
        table.att { width:100%; border-collapse:collapse; font-size:13px; }
        table.att th { border:1px solid #ccc; padding:7px 5px; background:#f5f5f5; text-align:center; font-weight:bold; }
        table.att td { border:1px solid #ccc; padding:6px 5px; text-align:center; }
        .date-col { text-align:left !important; padding-left:10px !important; font-weight:600; }
        .p  { color:#16a34a; font-weight:bold; }
        .a  { color:#dc2626; font-weight:bold; }
        .dl { color:#d97706; font-weight:bold; }
        .dash { color:#ccc; }
        .legend { margin-top:10px; font-size:12px; color:#555; }
        @media print { @page { size: A4 landscape; margin:15mm; } }
      </style></head>
      <body>
        <div class="title">Daily Attendance</div>
        <table class="info-table">
          <tr>
            <td><b>Student Name:</b> ${user.username || "-"}</td>
            <td><b>Roll No:</b> ${user.roll_number || "-"}</td>
            <td><b>Course:</b> ${dailyRaw[0]?.course_name || user.course_name || "-"}</td>
            <td><b>Year:</b> ${dailyRaw[0]?.year_number || user.year || "-"}</td>
            <td><b>Semester:</b> ${dailyRaw[0]?.semester || user.semester || "-"}</td>
          </tr>
        </table>
        <div class="rule">Using attendance rule from <b>${fmtDate(fromDate)}</b> to <b>${fmtDate(toDate)}</b></div>
        <table class="att">
          <thead><tr><th class="date-col">Dates</th>${hourHeaders}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="legend">P = Present &nbsp;&nbsp; A = Absent &nbsp;&nbsp; DL = Duty Leave</div>
      </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ── Print Course Wise Report ───────────────────────────────────────────────
  const handlePrintCourseWise = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const rows = courseReport.map((c, idx) => {
      const ahPct = c.total > 0 ? ((c.present / c.total) * 100).toFixed(2) : "0.00";
      const dlPct = c.total > 0 ? (((c.present + c.duty) / c.total) * 100).toFixed(2) : "0.00";
      const isLow = parseFloat(ahPct) < 75;
      return `<tr style="color:${isLow ? "#dc2626" : "#000"}">
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${idx + 1}</td>
        <td class="name-col" style="border:1px solid #ccc;padding:8px 6px">
          <b>${c.subject}</b>${c.course ? ` (${c.course})` : ""}
        </td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${c.total}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${c.present}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${c.duty}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${c.present + c.duty}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center;
            ${isLow ? "color:#dc2626;font-weight:700" : "color:#16a34a;font-weight:700"}">${ahPct} %</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center;font-weight:600">${dlPct} %</td>
      </tr>`;
    }).join("");

    const html = `
      <html><head><title>Course Wise Attendance Report</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 13px; padding: 24px; }
      .college { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 6px; }
      .report-title { text-align: center; font-size: 14px; font-weight: bold;
                      border: 2px solid #000; padding: 8px; margin-bottom: 12px; }
      .info { font-size: 13px; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      table th, table td { border: 1px solid #ccc; padding: 8px 6px;
                           font-size: 13px; word-break: keep-all; white-space: nowrap; }
      th { background: #f1f5f9; text-align: center; font-weight: bold; }
      td { text-align: center; }
      td.name-col { text-align: left; white-space: normal; word-break: break-word; }
      .note { font-size: 12px; color: #888; margin-top: 10px; }
      @media print { @page { size: A4 landscape; margin: 12mm; } }
      </style></head>
      <body>
        <div class="college">Learning Management System</div>
        <div class="report-title">Course Wise Attendance Report</div>
        <div class="info">
          <b>Student:</b> ${user.username || "-"} &nbsp;&nbsp;
          <b>Roll No:</b> ${user.roll_number || "-"} &nbsp;&nbsp;
          <b>Date Range:</b> ${fmtDate(cwFrom)} to ${fmtDate(cwTo)}
        </div>
        <p style="font-size:13px;margin-bottom:10px">
          Using attendance rule from <b>${fmtDate(cwFrom)}</b> to <b>${fmtDate(cwTo)}</b>
        </p>
        <table>
          <thead>
            <tr>
              <th>Sl.No</th><th>Course Name</th>
              <th>TH</th><th>AH</th><th>DL</th><th>AH+DL</th><th>AH%</th><th>AH+DL%</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="note">* Red rows indicate attendance below 75%</p>
        <p class="note">TH: Total Hours | AH: Attended Hours | DL: Duty Leave | AH%: Attendance %</p>
      </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ── format date for display ────────────────────────────────────────────────
  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="app" style={S.page}>
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content" style={S.content}>

            {/* ── PAGE HEADER ── */}
            <div>
              <h2 style={S.pageTitle}>My Attendance</h2>
              <p style={S.pageSubtitle}>View your attendance records</p>
            </div>

            {/* ── TAB BAR ── */}
            <div style={S.tabBar}>
              <button
                style={S.tab(view === "daily", "#059669")}
                onClick={() => setView("daily")}
              >
                📅 Daily Attendance
              </button>
              <button
                style={S.tab(view === "coursewise", "#7c3aed")}
                onClick={() => setView("coursewise")}
              >
                📊 Course Wise Report
              </button>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                DAILY ATTENDANCE TAB
            ════════════════════════════════════════════════════════════════ */}
            {view === "daily" && (
              <div style={S.card}>
                <div style={S.cardTitle}>Daily Attendance</div>

                {/* filter */}
                <div style={S.filterRow}>
                  <div>
                    <label style={S.label}>From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>To Date *</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={S.input}
                    />
                  </div>
                  <button style={S.btnPrimary("#059669")} onClick={fetchDaily}>
                    🔍 Search
                  </button>
                  <button style={S.btnOutline} onClick={resetDaily}>↺ Reset</button>
                  {dailyData.length > 0 && (
                    <button style={S.btnOutline} onClick={handlePrintDaily}>
                      🖨️ Print
                    </button>
                  )}
                </div>

                {dailyLoading ? (
                  <p style={S.empty}>Loading…</p>
                ) : dailyData.length === 0 ? (
                  <p style={S.empty}>
                    Select a date range and click Search to view attendance.
                  </p>
                ) : (
                  <>
                    <p style={S.ruleNote}>
                      Using attendance rule from <b>{fmtDate(fromDate)}</b> to{" "}
                      <b>{fmtDate(toDate)}</b>
                    </p>

                    <div style={S.tableWrap}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th(false)}>Dates</th>
                            {HOURS.map((h) => (
                              <th key={h} style={S.th(true)}>Hour {h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.map((row, idx) => {
                            const hasAny = Object.keys(row.hours).length > 0;
                            const isHoliday = !hasAny;

                            return (
                              <tr key={idx}>
                                {/* date cell — red if holiday */}
                                <td
                                  style={{
                                    ...S.td(false),
                                    fontWeight: 600,
                                    color: isHoliday ? "#dc2626" : "#1d4ed8",
                                  }}
                                >
                                  {fmtDate(row.date)}
                                </td>

                                {isHoliday ? (
                                  <td
                                    colSpan={10}
                                    style={{ ...S.td(false), ...S.holidayCell }}
                                  >
                                    Holiday / No Classes
                                  </td>
                                ) : (
                                  HOURS.map((h) => {
                                    const status = row.hours[h];
                                    return (
                                      <td key={h} style={S.td(true)}>
                                        {status ? (
                                          <span style={S.dot(status)}>
                                            {DOT_LABEL[status]}
                                          </span>
                                        ) : (
                                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                                            —
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* legend */}
                    <div style={S.legend}>
                      {[
                        ["present",    "P",  "Present"],
                        ["absent",     "A",  "Absent"],
                        ["duty_leave", "DL", "Duty Leave"],
                      ].map(([status, label, text]) => (
                        <div key={status} style={S.legendItem}>
                          <span style={S.dot(status)}>{label}</span>
                          {text}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                COURSE WISE REPORT TAB
            ════════════════════════════════════════════════════════════════ */}
            {view === "coursewise" && (
              <div style={S.card}>
                <div style={S.cardTitle}>Course Wise Report</div>

                {/* filter */}
                <div style={S.filterRow}>
                  <div>
                    <label style={S.label}>From Date</label>
                    <input
                      type="date"
                      value={cwFrom}
                      onChange={(e) => setCwFrom(e.target.value)}
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>To Date</label>
                    <input
                      type="date"
                      value={cwTo}
                      onChange={(e) => setCwTo(e.target.value)}
                      style={S.input}
                    />
                  </div>
                  <button style={S.btnPrimary("#7c3aed")} onClick={fetchCourseWise}>
                    🔍 Search
                  </button>
                  <button style={S.btnOutline} onClick={resetCourseWise}>↺ Reset</button>
                  {courseReport.length > 0 && (
                    <button style={S.btnOutline} onClick={handlePrintCourseWise}>
                      🖨️ Print
                    </button>
                  )}
                </div>

                {/* legend */}
                <div style={S.legendBox}>
                  <b>TH</b>: Total Hours &nbsp;|&nbsp;
                  <b>AH</b>: Attended Hours &nbsp;|&nbsp;
                  <b>DL</b>: Duty Leave Hours &nbsp;|&nbsp;
                  <b>AH+DL</b>: Attended + Duty Leave &nbsp;|&nbsp;
                  <b>AH%</b>: Attendance % &nbsp;|&nbsp;
                  <b>AH+DL%</b>: Attendance with Duty Leave %
                </div>

                {cwLoading ? (
                  <p style={S.empty}>Loading…</p>
                ) : courseReport.length === 0 ? (
                  <p style={S.empty}>
                    Select a date range and click Search to view your report.
                  </p>
                ) : (
                  <>
                    {cwFrom && cwTo && (
                      <p style={S.ruleNote}>
                        Using attendance rule from <b>{fmtDate(cwFrom)}</b> to{" "}
                        <b>{fmtDate(cwTo)}</b>
                      </p>
                    )}

                    <div style={S.tableWrap}>
                      <table style={{ ...S.table, whiteSpace: "normal" }}>
                        <thead>
                          <tr>
                            <th style={S.th(false)}>Sl.No</th>
                            <th style={S.th(false)}>Course Name</th>
                            <th style={S.th(true)}>TH</th>
                            <th style={S.th(true)}>AH</th>
                            <th style={S.th(true)}>DL</th>
                            <th style={S.th(true)}>AH+DL</th>
                            <th style={S.th(true)}>AH%</th>
                            <th style={S.th(true)}>AH+DL%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseReport.map((c, idx) => {
                            const ahPct = c.total > 0
                              ? ((c.present / c.total) * 100).toFixed(2)
                              : "0.00";
                            const dlPct = c.total > 0
                              ? (((c.present + c.duty) / c.total) * 100).toFixed(2)
                              : "0.00";
                            const isLow = parseFloat(ahPct) < 75;
                            return (
                              <tr key={idx} style={isLow ? S.lowRow : undefined}>
                                <td style={S.td(false)}>{idx + 1}</td>
                                <td style={S.td(false)}>
                                  <span style={{ fontWeight: 600 }}>{c.subject}</span>
                                  {c.course && (
                                    <span style={{ color: "#64748b", fontWeight: 400 }}>
                                      {" "}({c.course})
                                    </span>
                                  )}
                                </td>
                                <td style={S.td(true)}>{c.total}</td>
                                <td style={S.td(true)}>{c.present}</td>
                                <td style={S.td(true)}>{c.duty}</td>
                                <td style={S.td(true)}>{c.present + c.duty}</td>
                                <td style={{ ...S.td(true), ...(isLow ? S.pctBad : S.pctGood) }}>
                                  {ahPct} %
                                </td>
                                <td style={{ ...S.td(true), fontWeight: 600 }}>
                                  {dlPct} %
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
                      * Red rows indicate attendance below 75%
                    </p>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
