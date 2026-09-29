import { useEffect, useState } from "react";
import API from "../../service/API";
import "./Connections.css";

function Connections() {

    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD ALL CONNECTION DATA
    // =========================

    useEffect(() => {
        loadConnectionData();
    }, []);

    const loadConnectionData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                usersResponse,
                requestsResponse,
                connectedResponse
            ] = await Promise.all([
                API.get("/api/connection/users"),
                API.get("/api/connection/requests"),
                API.get("/api/connection/connected")
            ]);

            console.log("Users:", usersResponse.data);
            console.log("Requests:", requestsResponse.data);
            console.log("Connected:", connectedResponse.data);

            setUsers(usersResponse.data.users || []);
            setRequests(requestsResponse.data.request || []);
            setConnectedUsers(
                connectedResponse.data.connections || []
            );

        } catch (error) {

            console.error(
                "Failed to load connection data:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load connection data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // SEND CONNECTION REQUEST
    // =========================

    const sendRequest = async (receiverId) => {

        try {

            await API.post(
                `/api/connection/request/${receiverId}`
            );  

            alert("Connection request sent!");

            // Refresh users/requests
            loadConnectionData();

        } catch (error) {

            console.error(
                "Connection request error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to send connection request."
            );
        }
    };


    // =========================
    // ACCEPT REQUEST
    // =========================

    const acceptRequest = async (connectionId) => {

        try {

            await API.post(
                `/api/connection/accept/${connectionId}`
            );

            alert("Connection accepted!");

            loadConnectionData();

        } catch (error) {

            console.error(
                "Accept request error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to accept request."
            );
        }
    };


    // =========================
    // REJECT REQUEST
    // =========================

    const rejectRequest = async (connectionId) => {

        try {

            await API.post(
                `/api/connection/reject/${connectionId}`
            );

            alert("Connection rejected.");

            loadConnectionData();

        } catch (error) {

            console.error(
                "Reject request error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to reject request."
            );
        }
    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="connections-page">
                <h2>Loading connections...</h2>
            </div>
        );
    }


    return (

        <div className="connections-page">

            <div className="connections-container">

                <h1>Connections</h1>

                <p className="page-description">
                    Connect with other users and manage your connection requests.
                </p>


                {error && (
                    <div className="connection-error">
                        {error}
                    </div>
                )}


                {/* =========================
                    AVAILABLE USERS
                ========================= */}

                <section className="connection-section">

                    <div className="section-heading">
                        <h2>Discover People</h2>
                        <p>Send a request to connect with other users.</p>
                    </div>


                    <div className="users-grid">

                        {users.length === 0 ? (

                            <p>No other users found.</p>

                        ) : (

                            users.map((user) => (

                                <div
                                    className="user-card"
                                    key={user.id}
                                >

                                    <div className="user-avatar">
                                        {user.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>


                                    <div className="user-info">

                                        <h3>
                                            {user.name}
                                        </h3>

                                        <p>
                                            {user.email}
                                        </p>

                                    </div>


                                    <button
                                        onClick={() =>
                                            sendRequest(user.id)
                                        }
                                        className="connect-button"
                                    >
                                        Request to Connect
                                    </button>

                                </div>

                            ))

                        )}

                    </div>

                </section>


                {/* =========================
                    PENDING REQUESTS
                ========================= */}

                <section className="connection-section">

                    <div className="section-heading">

                        <h2>
                            Connection Requests
                        </h2>

                        <p>
                            Requests waiting for your response.
                        </p>

                    </div>


                    <div className="requests-list">

                        {requests.length === 0 ? (

                            <p>No pending requests.</p>

                        ) : (

                            requests.map((request) => (

                                <div
                                    className="request-card"
                                    key={request.id}
                                >

                                    <div>

                                        <h3>
                                            {request.sender?.name ||
                                                request.sender_name ||
                                                "User"}
                                        </h3>

                                        <p>
                                            wants to connect with you.
                                        </p>

                                    </div>


                                    <div className="request-actions">

                                        <button
                                            className="accept-button"
                                            onClick={() =>
                                                acceptRequest(request.id)
                                            }
                                        >
                                            Accept
                                        </button>


                                        <button
                                            className="reject-button"
                                            onClick={() =>
                                                rejectRequest(request.id)
                                            }
                                        >
                                            Reject
                                        </button>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>


                {/* =========================
                    CONNECTED USERS
                ========================= */}

                <section className="connection-section">

                    <div className="section-heading">

                        <h2>
                            My Connections
                        </h2>

                        <p>
                            People you are connected with.
                        </p>

                    </div>


                    <div className="users-grid">

                        {connectedUsers.length === 0 ? (

                            <p>
                                You don't have any connections yet.
                            </p>

                        ) : (

                            connectedUsers.map((connection) => (

                                <div
                                    className="user-card connected-card"
                                    key={connection.id}
                                >

                                    <div className="user-avatar">
                                        {(
                                            connection.user?.name ||
                                            connection.name ||
                                            "U"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>


                                    <div className="user-info">

                                        <h3>
                                            {connection.user?.name ||
                                                connection.name ||
                                                "User"}
                                        </h3>

                                        <p>
                                            {connection.user?.email ||
                                                connection.email ||
                                                ""}
                                        </p>

                                    </div>


                                    <span className="connected-badge">
                                        Connected
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Connections;