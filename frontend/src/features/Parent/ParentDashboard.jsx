import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";
import "./ParentModule.css";

export default function ParentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [data, setData] = useState(null);        // /parent/dashboard/ payload
  const [children, setChildren] = useState([]);  // [{id, username}]
  const [grades, setGrades] = useState([]);       // recent submissions
  const [activeChild, setActiveChild] = useState(null); // null = All Children
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const dashRes = await API.get("/parent/dashboard/");
      setData(dashRes.data);
      setChildren(dashRes.data?.children || []);

      // Recent grades = latest submissions across all children
      const subRes = await API.get("/submissions/");
      const subs = subRes.data?.results || subRes.data || [];
      setGrades(subs);
    } catch (err) {
      console.log("Parent dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // live refresh every 15s so teacher/admin updates show up automatically
    const t = setInterval(fetchAll, 15000);
    return () => clearInterval(t);
  }, []);

  // ---- helpers ----
  const matchChild = (record) => {
    if (activeChild === null) return true;
    const child = children.find((c) => c.id === activeChild);
    if (!child) return true;
    return (
      (record.student?.id || record.student) === activeChild ||
      record.student_name === child.username
    );
  };

  const attendanceEntries = Object.entries(data?.attendance_per_child || {});
  const visibleAttendance = activeChild === null
    ? attendanceEntries
    : attendanceEntries.filter(([name]) => {
        const child = children.find((c) => c.id === activeChild);
        return child && name === child.username;
      });

  const recentGrades = grades
    .filter(matchChild)
    .slice(0, 6);

  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const statusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "graded") return "pm-badge green";
    if (s === "submitted") return "pm-badge blue";
    if (s === "pending") return "pm-badge yellow";
    return "pm-badge gray";
  };

  // show status word in the current language (data value -> translated label)
  const statusText = (status = "") => {
    const s = status.toLowerCase();
    if (s === "graded") return t("graded");
    if (s === "submitted") return t("submitted");
    if (s === "pending") return t("pending");
    return status;
  };

  return (
    <div className="app">
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content">
            <div className="pm-page">

              {/* ── Header ── */}
              <div className="pm-header">
                <h1>{t("welcome")}, {user?.username || t("parents")}</h1>
                <p>{t("parent_dashboard")}</p>
              </div>

              {/* ── Child tabs ── */}
              <div className="pm-tabs">
                <div
                  className={`pm-tab ${activeChild === null ? "active" : ""}`}
                  onClick={() => setActiveChild(null)}
                >
                  {t("all_children")}
                </div>
                {children.map((c) => (
                  <div
                    key={c.id}
                    className={`pm-tab ${activeChild === c.id ? "active" : ""}`}
                    onClick={() => setActiveChild(c.id)}
                  >
                    {c.username}
                  </div>
                ))}
              </div>

              {loading && !data ? (
                <div className="pm-loading">{t("loading_dashboard")}</div>
              ) : (
                <>
                  {/* ── Stat cards ── */}
                  <div className="pm-stat-grid">
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("children_enrolled")}</div>
                      <div className="pm-stat-val blue">{data?.children_enrolled ?? 0}</div>
                    </div>
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("pending_fees")}</div>
                      <div className="pm-stat-val orange">
                        ₹{Number(data?.pending_fees || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("avg_attendance")}</div>
                      <div className="pm-stat-val green">{data?.avg_attendance ?? 0}%</div>
                    </div>
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("pending_assignments")}</div>
                      <div className="pm-stat-val red">{data?.pending_assignments ?? 0}</div>
                    </div>
                  </div>

                  <div className="pm-two-col">
                    {/* ── Recent grades ── */}
                    <div className="pm-card">
                      <div className="pm-card-title">{t("recent_grades")}</div>
                      {recentGrades.length === 0 ? (
                        <div className="pm-empty">{t("no_grades_yet")}</div>
                      ) : (
                        <table className="pm-table">
                          <thead>
                            <tr><th>{t("child")}</th><th>{t("subject")}</th><th>{t("marks")}</th><th>{t("status")}</th></tr>
                          </thead>
                          <tbody>
                            {recentGrades.map((s) => (
                              <tr key={s.id}>
                                <td>{s.student_name}</td>
                                <td>{s.subject_name}</td>
                                <td>
                                  {s.marks !== null && s.marks !== undefined
                                    ? `${s.marks}/${s.total_marks}`
                                    : "—"}
                                </td>
                                <td><span className={statusBadge(s.status)}>{statusText(s.status)}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* ── Right column: attendance + notifications ── */}
                    <div className="pm-stack">
                      <div className="pm-card">
                        <div className="pm-card-title">{t("attendance_overview")}</div>
                        {visibleAttendance.length === 0 ? (
                          <div className="pm-empty">{t("no_attendance_recorded")}</div>
                        ) : (
                          visibleAttendance.map(([name, a]) => {
                            const pct = a.percentage || 0;
                            const color = pct >= 85 ? "#16a34a" : pct >= 75 ? "#d97706" : "#dc2626";
                            return (
                              <div className="pm-progress-wrap" key={name}>
                                <div className="pm-progress-row">
                                  <div className="pm-progress-name">{name}</div>
                                  <div className="pm-progress-bar">
                                    <div className="pm-progress-fill" style={{ width: `${pct}%`, background: color }} />
                                  </div>
                                  <div className="pm-progress-pct">{pct}%</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="pm-card">
                        <div className="pm-card-title">{t("recent_notifications")}</div>
                        {(data?.recent_notifications || []).length === 0 ? (
                          <div className="pm-empty">{t("no_notifications")}</div>
                        ) : (
                          data.recent_notifications.map((n) => (
                            <div className="pm-notif-item" key={n.id}>
                              <div className={`pm-notif-dot ${n.is_read ? "gray" : ""}`} />
                              <div>
                                <div className="pm-notif-text">{n.title}</div>
                                <div className="pm-notif-time">{fmtTime(n.created_at)}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
