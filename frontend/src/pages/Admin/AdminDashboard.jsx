
import { useCallback, useEffect, useState } from "react";
import API from "../../service/API";
import "./AdminDashboard.css";

const sections = [
    { key: "users", label: "Users", endpoint: "/api/admin/users" },
    {
        key: "subscriptions",
        label: "Subscriptions",
        endpoint: "/api/admin/subscription",
    },
    { key: "wallets", label: "Wallets", endpoint: "/api/admin/wallets" },
    { key: "documents", label: "Documents", endpoint: "/api/admin/documents" },
    {
        key: "connections",
        label: "Connections",
        endpoint: "/api/admin/connections",
    },
];

const initialData = {
    users: [],
    subscriptions: [],
    wallets: [],
    documents: [],
    connections: [],
};

function getRows(response, key) {
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];

    // Support APIs that return another list property.
    const list = Object.values(data || {}).find(Array.isArray);
    return list || [];
}

function StatCard({ title, value, description }) {
    return (
        <div className="admin-stat-card">
            <p className="admin-stat-title">{title}</p>
            <h2>{value ?? 0}</h2>
            <span>{description}</span>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboard = useCallback(async (isRefresh = false) => {
        setError("");
        isRefresh ? setRefreshing(true) : setLoading(true);

        try {
            const results = await Promise.allSettled([
                API.get("/api/admin/stats"),
                ...sections.map((section) => API.get(section.endpoint)),
            ]);

            const statsResult = results[0];

            if (statsResult.status === "fulfilled") {
                setStats(statsResult.value.data);
            } else {
                throw statsResult.reason;
            }

            const nextData = { ...initialData };
            const failures = [];

            sections.forEach((section, index) => {
                const result = results[index + 1];

                if (result.status === "fulfilled") {
                    nextData[section.key] = getRows(
                        result.value,
                        section.key
                    );
                } else {
                    failures.push(section.label);
                }
            });

            setData(nextData);

            if (failures.length) {
                setError(
                    `Could not load: ${failures.join(", ")}. ` +
                    "Check that the corresponding backend routes exist."
                );
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Please log in to access the admin dashboard.");
            } else if (err.response?.status === 403) {
                setError("Access denied. Your account must have the admin role.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Could not load dashboard statistics. Check your backend."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const currentSection = sections.find(
        (section) => section.key === activeTab
    );

    const columns = {
        users: ["id", "name", "email", "role"],
        subscriptions: ["id", "user_id", "plan_id", "status"],
        wallets: ["id", "user_id", "balance"],
        documents: ["id", "user_id", "filename", "created_at"],
        connections: ["id", "sender_id", "receiver_id", "status"],
    };

    const prettyLabel = (value) =>
        value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading ConnectX Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <main className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <span className="admin-eyebrow">CONNECTX CONTROL PANEL</span>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor users, subscriptions, credits and platform activity.</p>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                >
                    {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>
            </header>

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            <section className="admin-stats-grid">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    description="Registered accounts"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.active_subscriptions}
                    description="Currently active"
                />
                <StatCard
                    title="Wallet Credits"
                    value={Number(stats.total_wallet_balance || 0).toLocaleString()}
                    description="Combined wallet balance"
                />
                <StatCard
                    title="Documents"
                    value={stats.total_documents}
                    description="Uploaded documents"
                />
                <StatCard
                    title="Connections"
                    value={stats.total_connections}
                    description="Connection records"
                />
             
                
            </section>

            <section className="admin-data-panel">
                <div className="admin-panel-heading">
                    <div>
                        <h2>Platform Management</h2>
              
                    </div>
                </div>

                <div className="admin-tabs">
                    {sections.map((section) => (
                        <button
                            key={section.key}
                            className={
                                activeTab === section.key ? "active" : ""
                            }
                            onClick={() => setActiveTab(section.key)}
                        >
                            {section.label}
                            <span>{data[section.key].length}</span>
                        </button>
                    ))}
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {columns[activeTab].map((column) => (
                                    <th key={column}>{prettyLabel(column)}</th>
                                ))}
                                {activeTab === "users" && <th>Details</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {data[activeTab].length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            columns[activeTab].length +
                                            (activeTab === "users" ? 1 : 0)
                                        }
                                        className="admin-empty"
                                    >
                                        No {currentSection.label.toLowerCase()} found.
                                    </td>
                                </tr>
                            ) : (
                                data[activeTab].map((item, index) => (
                                    <tr key={item.id ?? index}>
                                        {columns[activeTab].map((column) => (
                                            <td key={column}>
                                                {item[column] == null
                                                    ? "—"
                                                    : String(item[column])}
                                            </td>
                                        ))}

                                        {activeTab === "users" && (
                                            <td>
                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() =>
                                                        window.alert(
                                                            `User ID: ${item.id}\n` +
                                                            `Name: ${item.name ?? "—"}\n` +
                                                            `Email: ${item.email ?? "—"}\n` +
                                                            `Role: ${item.role ?? "—"}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;
