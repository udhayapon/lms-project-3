import { useEffect, useState, useRef } from "react";
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

  // header
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },

  // tab bar
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

  // card
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 18 },

  // filter grid
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 },
  input: {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
  },

  // buttons
  btnPrimary: (color = "#2563eb") => ({
    padding: "9px 22px",
    background: color,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
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
  btnActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 18 },

  // quick mark
  quickMark: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  quickLabel: { fontSize: 12, fontWeight: 600, color: "#64748b", marginRight: 4 },
  quickBtn: (bg, color, border) => ({
    padding: "5px 14px",
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  }),

  // table
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 500 },
  th: {
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    background: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  thCenter: {
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
    background: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: { padding: "11px 14px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" },
  tdCenter: { padding: "11px 14px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9", textAlign: "center" },

  // status buttons in table
  statusGroup: { display: "flex", gap: 6, justifyContent: "center" },
  statusBtn: (active, type) => {
    const colors = {
      present: { bg: "#dcfce7", color: "#15803d", activeBg: "#16a34a", activeColor: "white" },
      absent:  { bg: "#fee2e2", color: "#b91c1c", activeBg: "#dc2626", activeColor: "white" },
      duty_leave: { bg: "#fef3c7", color: "#b45309", activeBg: "#d97706", activeColor: "white" },
    };
    const c = colors[type];
    return {
      padding: "4px 13px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12,
      background: active ? c.activeBg : c.bg,
      color: active ? c.activeColor : c.color,
      transition: "all 0.15s",
    };
  },

  // summary chips
  summaryRow: { display: "flex", gap: 10, margin: "16px 0", flexWrap: "wrap" },
  chip: (bg, color) => ({
    padding: "6px 16px",
    borderRadius: 8,
    background: bg,
    color,
    fontWeight: 700,
    fontSize: 13,
  }),

  // save bar
  saveBar: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
    marginTop: 4,
  },
  savedMsg: { color: "#16a34a", fontWeight: 600, fontSize: 13 },

  // report table rows
  lowRow: { background: "#fff5f5" },

  // legend box
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

  // note text
  ruleNote: { fontSize: 12, color: "#64748b", marginBottom: 14 },

  // empty state
  empty: { color: "#94a3b8", fontSize: 14, padding: "20px 0" },

  // roll number badge
  rollBadge: {
    display: "inline-block",
    padding: "2px 8px",
    background: "#f1f5f9",
    borderRadius: 5,
    fontSize: 12,
    color: "#475569",
    fontWeight: 600,
  },

  // percentage cell
  pctGood: { color: "#16a34a", fontWeight: 700 },
  pctBad:  { color: "#dc2626", fontWeight: 700 },

  // success toast
  toast: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    background: "#dcfce7",
    color: "#15803d",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
  },
};

export default function AttendanceTeacher() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("mark"); // "mark" | "report"

  // ── mark attendance state ──────────────────────────────────────────────────
  const [subjects, setSubjects]         = useState([]);
  const [selectedTA, setSelectedTA]     = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHour, setSelectedHour] = useState(1);
  const [students, setStudents]         = useState([]);
  const [attendance, setAttendance]     = useState({});
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  // ── report state ───────────────────────────────────────────────────────────
  const [reportTA, setReportTA]         = useState("");
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");
  const [reportData, setReportData]     = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [dailyData, setDailyData] = useState(null);

  const printRef = useRef(null);
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // ── fetch teaching assignments ─────────────────────────────────────────────
  useEffect(() => {
    API.get("/teaching-assignments/?my=true").then((res) => {
      setSubjects(res.data?.results || res.data || []);
    });
  }, []);

  // ── fetch students when TA changes ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedTA) { setStudents([]); return; }
    setLoading(true);
    API.get(`/enrollments/?teaching_assignment=${selectedTA}`)
      .then((res) => {
        const raw = res.data;
        const data = Array.isArray(raw) ? raw : (raw?.results || []);
        console.log("ATTENDANCE DATA:", data);
        setStudents(data);
        const init = {};
        data.forEach((e) => { init[e.student] = "present"; });
        setAttendance(init);
      })
      .finally(() => setLoading(false));
  }, [selectedTA]);

  // ── load existing attendance when date/hour changes ────────────────────────
  useEffect(() => {
    if (!selectedTA || !selectedDate) return;
    API.get(
      `/attendance/?teaching_assignment=${selectedTA}&from_date=${selectedDate}&to_date=${selectedDate}`
    ).then((res) => {
      const data = res.data?.results || res.data || [];
      const hourData = data.filter((a) => a.hour === Number(selectedHour));
      if (hourData.length > 0) {
        const existing = {};
        hourData.forEach((a) => { existing[a.student] = a.status; });
        setAttendance((prev) => ({ ...prev, ...existing }));
      }
    });
  }, [selectedTA, selectedDate, selectedHour]);

  const markAll = (status) => {
    const all = {};
    students.forEach((e) => { all[e.student] = status; });
    setAttendance(all);
  };

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // ── save attendance ────────────────────────────────────────────────────────
  const saveAttendance = async () => {
    if (!selectedTA || !selectedDate) return alert("Please select subject and date.");
    setSaving(true);
    const records = students.map((e) => ({
      student: e.student,
      status: attendance[e.student] || "absent",
    }));
    try {
      await API.post("/attendance/bulk_mark/", {
        teaching_assignment: selectedTA,
        date: selectedDate,
        hour: Number(selectedHour),
        records,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error saving attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

// ── fetch report ───────────────────────────────────────────────────────────
  const fetchReport = async () => {
    if (!reportTA || !fromDate || !toDate)
      return alert("Please select subject and both dates.");
    setReportLoading(true);
    try {
      const res = await API.get(
        `/attendance/?teaching_assignment=${reportTA}&from_date=${fromDate}&to_date=${toDate}`
      );
      const data = res.data?.results || res.data || [];

      // ── summary map (existing) ──
      const studentMap = {};
      data.forEach((a) => {
        if (!studentMap[a.student]) {
          studentMap[a.student] = {
            name: a.student_name,
            roll: a.student_roll_no || "-",
            present: 0, absent: 0, duty: 0, total: 0,
          };
        }
        studentMap[a.student].total++;
        if (a.status === "present")       studentMap[a.student].present++;
        else if (a.status === "absent")   studentMap[a.student].absent++;
        else if (a.status === "duty_leave") studentMap[a.student].duty++;
      });
      setReportData(Object.values(studentMap));

      // ── raw daily map: { studentId: { date: { hour: status } } } ──
      const dailyMap = {};
      const allDatesSet = new Set();
      const allHoursSet = new Set();
      data.forEach((a) => {
        allDatesSet.add(a.date);
        allHoursSet.add(a.hour);
        if (!dailyMap[a.student]) {
          dailyMap[a.student] = {
            name: a.student_name,
            roll: a.student_roll_no || "-",
            course: a.course_name || "",
            year: a.year_number || "",
            semester: a.semester || "",
            dates: {},
          };
        }
        if (!dailyMap[a.student].dates[a.date]) {
          dailyMap[a.student].dates[a.date] = {};
        }
        dailyMap[a.student].dates[a.date][a.hour] = a.status;
      });
      setDailyData({
        students: Object.values(dailyMap),
        dates: [...allDatesSet].sort(),
        hours: [...allHoursSet].sort((a, b) => a - b),
      });

    } catch {
      alert("Error fetching report.");
    } finally {
      setReportLoading(false);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const subject = subjects.find((s) => String(s.id) === String(reportTA));
    const subjectName = subject ? `${subject.subject_name} (Sem ${subject.semester})` : "";

    const rows = reportData.map((s, idx) => {
      const ahPct = s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : "0.00";
      const dlPct = s.total > 0 ? (((s.present + s.duty) / s.total) * 100).toFixed(2) : "0.00";
      const isLow = parseFloat(ahPct) < 75;
      return `
        <tr style="color:${isLow ? "#dc2626" : "#000"}">
          <td class="center" style="border:1px solid #ccc;padding:6px">${idx + 1}</td>
          <td class="name-col" style="border:1px solid #ccc;padding:6px">${s.name}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center">${s.roll}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center">${s.total}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center">${s.present}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center">${s.duty}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center">${s.present + s.duty}</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center;${isLow ? "color:#dc2626;font-weight:700" : "color:#16a34a;font-weight:700"}">${ahPct} %</td>
          <td style="border:1px solid #ccc;padding:6px;text-align:center;font-weight:600">${dlPct} %</td>
        </tr>`;
    }).join("");

    const html = `
      <html><head><title>Attendance Report</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; }
        .college-name { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 6px; }
        .report-title { text-align: center; font-size: 14px; font-weight: bold;
                        border: 2px solid #000; padding: 7px; margin-bottom: 10px; }
        .info-row { display: flex; gap: 20px; margin-bottom: 6px; font-size: 13px; }
        .rule-note { font-size: 13px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; table-layout: auto; font-size: 12px; }
        th { background: #f1f5f9; border: 1px solid #ccc; padding: 7px 6px;
             text-align: center; font-size: 12px; font-weight: bold; white-space: nowrap; }
        td { border: 1px solid #ccc; padding: 6px; white-space: nowrap; }
        td.name-col { white-space: normal; word-break: break-word; text-align: left; }
        td.center { text-align: center; }
        .footer-note { font-size: 11px; color: #888; margin-top: 8px; }
        @media print { @page { size: A4 landscape; margin: 10mm; } button { display: none; } }
      </style></head>
      <body>
        <div class="college-name">Learning Management System</div>
        <div class="report-title">Course Wise Attendance Report</div>
        <div class="info-row">
          <span><b>Subject:</b> ${subjectName}</span>
          <span><b>Date Range:</b> ${fromDate} to ${toDate}</span>
        </div>
        <p class="rule-note">Using attendance rule from <b>${fromDate}</b> to <b>${toDate}</b></p>
        <table>
          <thead>
            <tr>
              <th>Sl.No</th><th>Student Name</th><th>Roll No</th>
              <th>TH</th><th>AH</th><th>DL</th><th>AH+DL</th><th>AH%</th><th>AH+DL%</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="footer-note">* Red rows indicate attendance below 75%</p>
        <p class="footer-note">
          TH: Total Hours | AH: Attended Hours | DL: Duty Leave Hours |
          AH+DL: Attended + Duty Leave | AH%: Attendance % | AH+DL%: Attendance with Duty Leave %
        </p>
      </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

 
  // ── counts ─────────────────────────────────────────────────────────────────
  const resetReport = () => {
    setReportTA("");
    setFromDate("");
    setToDate("");
    setReportData([]);
    setDailyData(null);
  };
  
  const presentCount  = Object.values(attendance).filter((v) => v === "present").length;
  const absentCount   = Object.values(attendance).filter((v) => v === "absent").length;
  const dutyCount     = Object.values(attendance).filter((v) => v === "duty_leave").length;

  return (
    <div className="app" style={S.page}>
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content" style={S.content}>

            {/* ── PAGE HEADER ── */}
            <div>
              <h2 style={S.pageTitle}>Attendance</h2>
              <p style={S.pageSubtitle}>Mark and view student attendance</p>
            </div>

            {/* ── TAB BAR ── */}
            <div style={S.tabBar}>
              <button
                style={S.tab(view === "mark", "#2563eb")}
                onClick={() => setView("mark")}
              >
                ✏️ Mark Attendance
              </button>
              <button
                style={S.tab(view === "report", "#7c3aed")}
                onClick={() => setView("report")}
              >
                📊 View Report
              </button>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                MARK ATTENDANCE TAB
            ════════════════════════════════════════════════════════════════ */}
            {view === "mark" && (
              <div style={S.card}>
                <div style={S.cardTitle}>Mark Attendance</div>

                {/* filters */}
                <div style={S.filterGrid}>
                  <div>
                    <label style={S.label}>Subject</label>
                    <select
                      value={selectedTA}
                      onChange={(e) => setSelectedTA(e.target.value)}
                      style={S.input}
                    >
                      <option value="">— Select Subject —</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.subject_name} (Sem {s.semester})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Hour</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(Number(e.target.value))}
                      style={S.input}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>Hour {h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* quick mark */}
                {students.length > 0 && (
                  <div style={S.quickMark}>
                    <span style={S.quickLabel}>Mark all:</span>
                    <button
                      style={S.quickBtn("#dcfce7", "#15803d", "#86efac")}
                      onClick={() => markAll("present")}
                    >
                      ✓ All Present
                    </button>
                    <button
                      style={S.quickBtn("#fee2e2", "#b91c1c", "#fca5a5")}
                      onClick={() => markAll("absent")}
                    >
                      ✗ All Absent
                    </button>
                  </div>
                )}

                {/* student table */}
                {loading ? (
                  <p style={S.empty}>Loading students…</p>
                ) : !selectedTA ? (
                  <p style={S.empty}>Select a subject above to mark attendance.</p>
                ) : students.length === 0 ? (
                  <p style={S.empty}>No students enrolled in this subject.</p>
                ) : (
                  <>
                    <div style={S.tableWrap}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th}>Sl.No</th>
                            <th style={S.th}>Student Name</th>
                            <th style={S.th}>Roll No</th>
                            <th style={S.thCenter}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((e, idx) => {
                            const status = attendance[e.student] || "absent";
                            return (
                              <tr key={e.id}>
                                <td style={S.td}>{idx + 1}</td>
                                <td style={S.td}>{e.student_name}</td>
                                <td style={S.td}>
                                  <span style={S.rollBadge}>
                                    {e.student_roll_no || "—"}
                                  </span>
                                </td>
                                <td style={S.tdCenter}>
                                  <div style={S.statusGroup}>
                                    {["present", "absent", "duty_leave"].map((s) => (
                                      <button
                                        key={s}
                                        style={S.statusBtn(status === s, s)}
                                        onClick={() => setStatus(e.student, s)}
                                      >
                                        {s === "present" ? "P" : s === "absent" ? "A" : "DL"}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* summary */}
                    <div style={S.summaryRow}>
                      <span style={S.chip("#dcfce7", "#15803d")}>Present: {presentCount}</span>
                      <span style={S.chip("#fee2e2", "#b91c1c")}>Absent: {absentCount}</span>
                      <span style={S.chip("#fef3c7", "#b45309")}>Duty Leave: {dutyCount}</span>
                    </div>

                    {/* save */}
                    <div style={S.saveBar}>
                      <button
                        style={S.btnPrimary(saving ? "#94a3b8" : "#2563eb")}
                        onClick={saveAttendance}
                        disabled={saving}
                      >
                        💾 {saving ? "Saving…" : "Save Attendance"}
                      </button>
                      {saved && (
                        <span style={S.toast}>✓ Attendance saved successfully!</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                VIEW REPORT TAB
            ════════════════════════════════════════════════════════════════ */}
            {view === "report" && (
              <div style={S.card}>
                <div style={S.cardTitle}>Course Wise Attendance Report</div>

                {/* filters */}
                <div style={S.filterGrid}>
                  <div>
                    <label style={S.label}>Subject</label>
                    <select
                      value={reportTA}
                      onChange={(e) => setReportTA(e.target.value)}
                      style={S.input}
                    >
                      <option value="">— Select Subject —</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.subject_name} (Sem {s.semester})
                        </option>
                      ))}
                    </select>
                  </div>
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
                    <label style={S.label}>To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={S.btnActions}>
                  <button
                    style={S.btnPrimary("#7c3aed")}
                    onClick={fetchReport}
                    disabled={reportLoading}
                  >
                    🔍 {reportLoading ? "Loading…" : "Search"}
                  </button>
                  <button style={S.btnOutline} onClick={resetReport}>↺ Reset</button>
                  {reportData.length > 0 && (
                    <button
                      style={S.btnOutline}
                      onClick={handlePrint}
                    >
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

                {fromDate && toDate && reportData.length > 0 && (
                  <p style={S.ruleNote}>
                    Using attendance rule from <b>{fromDate}</b> to <b>{toDate}</b>
                  </p>
                )}

                {reportLoading ? (
                  <p style={S.empty}>Loading report…</p>
                ) : reportData.length === 0 ? (
                  <p style={S.empty}>
                    Select subject and date range, then click Search.
                  </p>
                ) : (
                  <>
                    <div style={S.tableWrap}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th}>Sl.No</th>
                            <th style={S.th}>Student Name</th>
                            <th style={S.th}>Roll No</th>
                            <th style={S.thCenter}>TH</th>
                            <th style={S.thCenter}>AH</th>
                            <th style={S.thCenter}>DL</th>
                            <th style={S.thCenter}>AH+DL</th>
                            <th style={S.thCenter}>AH%</th>
                            <th style={S.thCenter}>AH+DL%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.map((s, idx) => {
                            const ahPct  = s.total > 0
                              ? ((s.present / s.total) * 100).toFixed(2)
                              : "0.00";
                            const dlPct  = s.total > 0
                              ? (((s.present + s.duty) / s.total) * 100).toFixed(2)
                              : "0.00";
                            const isLow  = parseFloat(ahPct) < 75;
                            return (
                              <tr
                                key={idx}
                                style={isLow ? S.lowRow : undefined}
                              >
                                <td style={S.td}>{idx + 1}</td>
                                <td style={S.td}>{s.name}</td>
                                <td style={S.td}>
                                  <span style={S.rollBadge}>{s.roll}</span>
                                </td>
                                <td style={S.tdCenter}>{s.total}</td>
                                <td style={S.tdCenter}>{s.present}</td>
                                <td style={S.tdCenter}>{s.duty}</td>
                                <td style={S.tdCenter}>{s.present + s.duty}</td>
                                <td style={{ ...S.tdCenter, ...(isLow ? S.pctBad : S.pctGood) }}>
                                  {ahPct} %
                                </td>
                                <td style={{ ...S.tdCenter, fontWeight: 600 }}>
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
