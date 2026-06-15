import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";
import "./ParentModule.css";

export default function ParentFees() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // pay popup state
  const [payFee, setPayFee] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    API.get("/parent/dashboard/")
      .then((res) => setChildren(res.data?.children || []))
      .catch((err) => console.log("children fetch error:", err));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // FeeViewSet already scopes to the parent's children.
      const res = await API.get("/fees/");
      setFees(res.data?.results || res.data || []);
    } catch (err) {
      console.log("Parent fees fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tmr = setInterval(fetchData, 15000);
    return () => clearInterval(tmr);
  }, []);

  // filter by selected child (client-side; Fee has student + student_name)
  const visible = fees.filter((f) => {
    if (activeChild === null) return true;
    const child = children.find((c) => c.id === activeChild);
    return (f.student?.id || f.student) === activeChild || f.student_name === child?.username;
  });

  // ── amount helpers (fall back gracefully if backend fields are missing) ──
  const paidVal = (f) =>
    Number(f.paid_amount ?? (f.status === "paid" ? f.amount : 0));
  const pendingVal = (f) =>
    Number(f.pending_amount ?? (Number(f.amount || 0) - paidVal(f)));

  const totalFees = visible.reduce((s, f) => s + Number(f.amount || 0), 0);
  const paid = visible.reduce((s, f) => s + paidVal(f), 0);
  const pending = totalFees - paid;
  const nextDue = visible
    .filter((f) => f.status !== "paid" && f.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // ── status badge (now handles "partial") ──
  const statusBadge = (f) => {
    if (f.status === "paid")
      return <span className="pm-badge green">{t("paid")}</span>;
    if (f.status === "partial")
      return <span className="pm-badge" style={{ background: "#fef3c7", color: "#92400e" }}>{t("partial")}</span>;
    return <span className="pm-badge red">{t("pending")}</span>;
  };

  // ── open / submit payment ──
  const openPay = (f) => {
    setPayFee(f);
    setPayAmount(String(pendingVal(f)));
    setPayError("");
  };

  const submitPay = async () => {
    const amt = Number(payAmount);
    const remaining = pendingVal(payFee);
    if (!amt || amt <= 0) { setPayError(t("enter_amount_gt_zero")); return; }
    if (amt > remaining)  { setPayError(`${t("remaining")}: ${money(remaining)}.`); return; }
    try {
      setPaying(true);
      setPayError("");
      await API.post(`/fees/${payFee.id}/pay/`, { amount: amt });
      setPayFee(null);
      await fetchData();
    } catch (err) {
      setPayError(err.response?.data?.detail || t("payment_failed"));
    } finally {
      setPaying(false);
    }
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
                <h1>{t("fee_details")}</h1>
                <p>{t("payment_history_dues")}</p>
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
                <div className="pm-loading">{t("loading_fees")}</div>
              ) : (
                <div className="pm-two-col">
                  {/* ── Summary ── */}
                  <div className="pm-card">
                    <div className="pm-card-title">{t("fee_summary")}</div>
                    <div className="pm-fee-row">
                      <span className="pm-fee-label">{t("total_fees")}</span>
                      <span className="pm-fee-val">{money(totalFees)}</span>
                    </div>
                    <div className="pm-fee-row">
                      <span className="pm-fee-label">{t("paid")}</span>
                      <span className="pm-fee-val green">{money(paid)}</span>
                    </div>
                    <div className="pm-fee-row">
                      <span className="pm-fee-label">{t("pending")}</span>
                      <span className="pm-fee-val red">{money(pending)}</span>
                    </div>
                    <div className="pm-fee-row">
                      <span className="pm-fee-label">{t("next_due_date")}</span>
                      <span className="pm-fee-val">{fmtDate(nextDue?.due_date)}</span>
                    </div>
                  </div>

                  {/* ── History ── */}
                  <div className="pm-card">
                    <div className="pm-card-title">{t("payment_history")}</div>
                    {visible.length === 0 ? (
                      <div className="pm-empty">{t("no_fee_records")}</div>
                    ) : (
                      <table className="pm-table">
                        <thead>
                          <tr>
                            <th>{t("child")}</th><th>{t("term")}</th><th>{t("total")}</th>
                            <th>{t("paid")}</th><th>{t("pending")}</th><th>{t("status")}</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((f) => (
                            <tr key={f.id}>
                              <td>{f.student_name}</td>
                              <td>{f.term}</td>
                              <td>{money(f.amount)}</td>
                              <td className="green">{money(paidVal(f))}</td>
                              <td className="red">{money(pendingVal(f))}</td>
                              <td>{statusBadge(f)}</td>
                              <td>
                                {f.status !== "paid" && (
                                  <button
                                    onClick={() => openPay(f)}
                                    style={{
                                      padding: "5px 14px", borderRadius: 8, border: "none",
                                      background: "#0f172a", color: "#fff", fontSize: 12,
                                      fontWeight: 600, cursor: "pointer",
                                    }}
                                  >
                                    {t("pay")}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAY POPUP ── */}
      {payFee && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
            zIndex: 1000, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && !paying && setPayFee(null)}
        >
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              {t("pay_fee")}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              {payFee.student_name} · {payFee.term}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#64748b" }}>{t("total")}</span>
              <span style={{ fontWeight: 600 }}>{money(payFee.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 16 }}>
              <span style={{ color: "#64748b" }}>{t("remaining")}</span>
              <span style={{ fontWeight: 700, color: "#b91c1c" }}>{money(pendingVal(payFee))}</span>
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
              {t("amount_to_pay")}
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box",
              }}
            />

            {payError && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 8 }}>{payError}</div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button
                onClick={() => setPayFee(null)}
                disabled={paying}
                style={{
                  padding: "9px 16px", borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151",
                }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={submitPay}
                disabled={paying}
                style={{
                  padding: "9px 18px", borderRadius: 10, border: "none",
                  background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: paying ? "default" : "pointer", opacity: paying ? 0.7 : 1,
                }}
              >
                {paying ? t("paying") : t("pay_now")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
