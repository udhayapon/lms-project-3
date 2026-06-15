import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";
import "./ParentModule.css";

export default function ParentAttendance() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/parent/dashboard/")
      .then((res) => setChildren(res.data?.children || []))
      .catch((err) => console.log("children fetch error:", err));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = activeChild ? `?child=${activeChild}` : "";
      const res = await API.get(`/attendance/${q}`);
      setRecords(res.data?.results || res.data || []);
    } catch (err) {
      console.log("Parent attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tmr = setInterval(fetchData, 15000);
    return () => clearInterval(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild]);

  // ── overall totals ──
  const total = records.length;
  const present = records.filter((r) => (r.status || "").toLowerCase() === "present").length;
  const absent = total - present;

  // ── subject-wise breakdown ──
  const bySubject = {};
  records.forEach((r) => {
    const key = `${r.student_name} • ${r.subject_name}`;
    if (!bySubject[key]) {
      bySubject[key] = { child: r.student_name, subject: r.subject_name, total: 0, present: 0 };
    }
    bySubject[key].total += 1;
    if ((r.status || "").toLowerCase() === "present") bySubject[key].present += 1;
  });
  const subjectRows = Object.values(bySubject).map((s) => {
    const pct = s.total ? Math.round((s.present / s.total) * 100) : 0;
    return { ...s, absent: s.total - s.present, pct };
  });

  const pctBadge = (pct) => {
    if (pct >= 90) return "pm-badge green";
    if (pct >= 75) return "pm-badge yellow";
    return "pm-badge red";
  };

  const pctLabel = (pct) => {
    if (pct >= 90) return t("good");
    if (pct >= 75) return t("average");
    return t("low");
  };

  return (
    <div className="app">
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content">
            <div className="pm-page">

              <div className="pm-header">
                <h1>{t("attendance")}</h1>
                <p>{t("attendance_records_children")}</p>
              </div>

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

              {loading ? (
                <div className="pm-loading">{t("loading_attendance")}</div>
              ) : (
                <>
                  <div className="pm-stat-grid three">
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("total_classes")}</div>
                      <div className="pm-stat-val">{total}</div>
                    </div>
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("present")}</div>
                      <div className="pm-stat-val green">{present}</div>
                    </div>
                    <div className="pm-stat-card">
                      <div className="pm-stat-label">{t("absent")}</div>
                      <div className="pm-stat-val red">{absent}</div>
                    </div>
                  </div>

                  <div className="pm-card">
                    <div className="pm-card-title">{t("subject_wise_attendance")}</div>
                    {subjectRows.length === 0 ? (
                      <div className="pm-empty">{t("no_attendance_recorded")}</div>
                    ) : (
                      <table className="pm-table">
                        <thead>
                          <tr>
                            <th>{t("child")}</th><th>{t("subject")}</th><th>{t("total")}</th>
                            <th>{t("present")}</th><th>{t("absent")}</th><th>%</th><th>{t("status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectRows.map((s, i) => (
                            <tr key={i}>
                              <td>{s.child}</td>
                              <td>{s.subject}</td>
                              <td>{s.total}</td>
                              <td>{s.present}</td>
                              <td>{s.absent}</td>
                              <td>{s.pct}%</td>
                              <td><span className={pctBadge(s.pct)}>
                                {pctLabel(s.pct)}
                              </span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
