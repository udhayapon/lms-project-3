import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";
import "./ParentModule.css";

export default function ParentGrades() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null); // null = All Children
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // children list (for tabs) comes from the parent dashboard endpoint
  useEffect(() => {
    API.get("/parent/dashboard/")
      .then((res) => setChildren(res.data?.children || []))
      .catch((err) => console.log("children fetch error:", err));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = activeChild ? `?child=${activeChild}` : "";
      const subRes = await API.get(`/submissions/${q}`);
      setSubmissions(subRes.data?.results || subRes.data || []);
      const quizRes = await API.get(`/quiz-attempts/${q}`);
      setQuizAttempts(quizRes.data?.results || quizRes.data || []);
    } catch (err) {
      console.log("Parent grades fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tmr = setInterval(fetchData, 15000); // live refresh
    return () => clearInterval(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild]);

  const statusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "graded") return "pm-badge green";
    if (s === "submitted") return "pm-badge blue";
    if (s === "pending") return "pm-badge yellow";
    return "pm-badge gray";
  };

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

              <div className="pm-header">
                <h1>{t("grades")}</h1>
                <p>{t("academic_performance")}</p>
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
                <div className="pm-loading">{t("loading_grades")}</div>
              ) : (
                <>
                  {/* ── Assignment results ── */}
                  <div className="pm-card">
                    <div className="pm-card-title">{t("assignment_results")}</div>
                    {submissions.length === 0 ? (
                      <div className="pm-empty">{t("no_submissions_yet")}</div>
                    ) : (
                      <table className="pm-table">
                        <thead>
                          <tr>
                            <th>{t("child")}</th><th>{t("subject")}</th><th>{t("assignment")}</th>
                            <th>{t("marks")}</th><th>{t("status")}</th><th>{t("feedback")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((s) => (
                            <tr key={s.id}>
                              <td>{s.student_name}</td>
                              <td>{s.subject_name}</td>
                              <td>{s.assignment_title}</td>
                              <td>
                                {s.marks !== null && s.marks !== undefined
                                  ? `${s.marks}/${s.total_marks}`
                                  : "—"}
                              </td>
                              <td><span className={statusBadge(s.status)}>{statusText(s.status)}</span></td>
                              <td>{s.feedback || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* ── Quiz results ── */}
                  <div className="pm-card">
                    <div className="pm-card-title">{t("quiz_results")}</div>
                    {quizAttempts.length === 0 ? (
                      <div className="pm-empty">{t("no_quiz_attempts")}</div>
                    ) : (
                      <table className="pm-table">
                        <thead>
                          <tr><th>{t("child")}</th><th>{t("quiz")}</th><th>{t("score")}</th><th>{t("submitted")}</th></tr>
                        </thead>
                        <tbody>
                          {quizAttempts.map((q) => (
                            <tr key={q.id}>
                              <td>{q.student_name}</td>
                              <td>{q.quiz_title}</td>
                              <td><strong>{q.score}</strong></td>
                              <td>{q.submitted_at ? new Date(q.submitted_at).toLocaleString() : "—"}</td>
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
