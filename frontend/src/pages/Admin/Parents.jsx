import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import API from "../../api";

// ✅ Moved OUTSIDE — fixes the focus/re-render bug
function StudentSearchPanel({ query, setQuery, selected, setSelected, students, label = "Search children by name" }) {
  const matches = !query.trim()
    ? []
    : students.filter((s) => s.username.toLowerCase().includes(query.toLowerCase()));

  const groupByCourse = (list) => {
    const groups = {};
    list.forEach((s) => {
      const key = s.course_name || "Unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  };

  const toggle = (list, id) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const grouped = groupByCourse(matches);

  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type student name..."
          style={{
            width: "100%", fontSize: 13, padding: "8px 12px 8px 32px",
            border: "0.5px solid #e2e8f0", borderRadius: 8,
            background: "#f8fafc", outline: "none", color: "#0f172a",
          }}
        />
      </div>

      <div style={{
        background: "#f8fafc", border: "0.5px solid #e2e8f0",
        borderRadius: 10, padding: "12px 14px", marginBottom: 12, minHeight: 70,
      }}>
        {!query.trim() ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "12px 0" }}>
            Start typing a name to search students
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "12px 0" }}>
            No students found for "{query}"
          </div>
        ) : (
          Object.entries(grouped).map(([course, list]) => (
            <div key={course} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>{course}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {list.map((s) => {
                  const checked = selected.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 12, padding: "5px 12px", borderRadius: 8,
                        border: checked ? "0.5px solid #2563eb" : "0.5px solid #e2e8f0",
                        background: checked ? "#eef4ff" : "#fff",
                        color: checked ? "#1d4ed8" : "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelected((l) => toggle(l, s.id))}
                        style={{ accentColor: "#2563eb", width: 12, height: 12 }}
                      />
                      {s.username}
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        Selected children
      </div>
      <div style={{ minHeight: 28 }}>
        {selected.length === 0 ? (
          <span style={{ fontSize: 12, color: "#94a3b8" }}>None selected</span>
        ) : (
          selected.map((id) => {
            const s = students.find((x) => x.id === id);
            if (!s) return null;
            return (
              <span
                key={id}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, padding: "3px 8px", borderRadius: 20,
                  background: "#dbeafe", color: "#1e40af", margin: "2px",
                }}
              >
                {s.username}
                <span
                  onClick={() => setSelected((l) => l.filter((x) => x !== id))}
                  style={{ cursor: "pointer", fontSize: 13, color: "#1d4ed8", lineHeight: 1 }}
                >×</span>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Parents() {
  const [open, setOpen] = useState(false);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newChildren, setNewChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editMap, setEditMap] = useState({});
  const [editSearch, setEditSearch] = useState("");

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/manage/parents/");
      const ps = res.data?.parents || [];
      setParents(ps);
      setStudents(res.data?.students || []);
      const map = {};
      ps.forEach((p) => {
        map[p.profile_id] = p.children.map((c) => c.id);
      });
      setEditMap(map);
    } catch (err) {
      console.log("Parents fetch error:", err);
      flash("Could not load parents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = (list, id) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const createParent = async () => {
    if (!username.trim() || !password.trim()) {
      flash("Username and password are required");
      return;
    }
    try {
      await API.post("/manage/parents/", {
        username: username.trim(),
        password: password.trim(),
        children: newChildren,
      });
      flash("Parent created successfully");
      setUsername("");
      setPassword("");
      setNewChildren([]);
      setSearchQuery("");
      fetchData();
    } catch (err) {
      flash(err.response?.data?.detail || "Could not create parent");
    }
  };

  const saveChildren = async (profileId) => {
    try {
      await API.post(`/manage/parents/${profileId}/children/`, {
        children: editMap[profileId] || [],
      });
      flash("Children updated");
      setEditingId(null);
      setEditSearch("");
      fetchData();
    } catch (err) {
      flash(err.response?.data?.detail || "Could not update children");
    }
  };

  const initials = (name = "") => name.slice(0, 2).toUpperCase();
  const avatarColors = ["#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2"];
  const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="app">
      <Navbar setOpen={setOpen} />
      <div className="layout">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="main">
          <div className="content">

            {toast && <div className="toast">{toast}</div>}

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "#0f172a" }}>Parents</h1>
              <p style={{ color: "#64748b", fontSize: 15, marginTop: 4 }}>
                Create parent accounts and link them to their children
              </p>
            </div>

            <div style={{
              background: "#fff", border: "0.5px solid #e2e8f0",
              borderRadius: 14, padding: 24, marginBottom: 20,
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 600, color: "#0f172a",
                marginBottom: 16, paddingBottom: 12,
                borderBottom: "0.5px solid #f1f5f9",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                Add a parent
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                    Parent username
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Ravi.P"
                    value={username}
                    autoComplete="off"
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%", fontSize: 13, padding: "8px 12px",
                      border: "0.5px solid #e2e8f0", borderRadius: 8,
                      background: "#f8fafc", outline: "none", color: "#0f172a",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                    Password
                  </div>
                  <input
                    type="password"
                    placeholder="Set a password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%", fontSize: 13, padding: "8px 12px",
                      border: "0.5px solid #e2e8f0", borderRadius: 8,
                      background: "#f8fafc", outline: "none", color: "#0f172a",
                    }}
                  />
                </div>
              </div>

              <StudentSearchPanel
                query={searchQuery}
                setQuery={setSearchQuery}
                selected={newChildren}
                setSelected={setNewChildren}
                students={students}
              />

              <button
                onClick={createParent}
                style={{
                  marginTop: 16, background: "#2563eb", color: "#fff",
                  border: "none", borderRadius: 8, padding: "9px 24px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Create parent
              </button>
            </div>

            <div style={{
              background: "#fff", border: "0.5px solid #e2e8f0",
              borderRadius: 14, padding: 24,
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 600, color: "#0f172a",
                marginBottom: 16, paddingBottom: 12,
                borderBottom: "0.5px solid #f1f5f9",
              }}>
                Existing parents
              </h3>

              {loading ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>Loading…</div>
              ) : parents.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>No parents created yet</div>
              ) : (
                <>
                  <div style={{
                    display: "grid", gridTemplateColumns: "2fr 3fr 120px",
                    gap: 8, fontSize: 11, color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    paddingBottom: 8, borderBottom: "0.5px solid #f1f5f9", marginBottom: 4,
                  }}>
                    <span>Parent</span><span>Children</span><span>Actions</span>
                  </div>

                  {parents.map((p) => (
                    <div key={p.profile_id}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "2fr 3fr 120px",
                        gap: 8, alignItems: "center",
                        padding: "10px 0", borderBottom: "0.5px solid #f8fafc",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: getColor(p.username), color: "#fff",
                            fontSize: 11, fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {initials(p.username)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.username}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>Parent</div>
                          </div>
                        </div>

                        <div>
                          {p.children.length === 0 ? (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>No children linked</span>
                          ) : (
                            p.children.map((c) => (
                              <span key={c.id} style={{
                                display: "inline-block", fontSize: 11, padding: "3px 8px",
                                borderRadius: 20, background: "#dbeafe", color: "#1e40af", margin: "2px",
                              }}>
                                {c.username}
                              </span>
                            ))
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span
                            onClick={() => {
                              setEditingId(editingId === p.profile_id ? null : p.profile_id);
                              setEditSearch("");
                            }}
                            style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}
                          >
                            ✏️ Edit
                          </span>
                        </div>
                      </div>

                      {editingId === p.profile_id && (
                        <div style={{
                          background: "#f8fafc", border: "0.5px solid #e2e8f0",
                          borderRadius: 10, padding: 16, margin: "8px 0 12px",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
                            Edit children for {p.username}
                          </div>
                          <StudentSearchPanel
                            query={editSearch}
                            setQuery={setEditSearch}
                            selected={editMap[p.profile_id] || []}
                            setSelected={(fn) =>
                              setEditMap((m) => ({
                                ...m,
                                [p.profile_id]: typeof fn === "function" ? fn(m[p.profile_id] || []) : fn,
                              }))
                            }
                            students={students}
                            label="Search children to update"
                          />
                          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                            <button
                              onClick={() => saveChildren(p.profile_id)}
                              style={{
                                background: "#2563eb", color: "#fff", border: "none",
                                borderRadius: 8, padding: "8px 20px", fontSize: 13,
                                fontWeight: 600, cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditSearch(""); }}
                              style={{
                                background: "transparent", color: "#64748b",
                                border: "0.5px solid #e2e8f0",
                                borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
