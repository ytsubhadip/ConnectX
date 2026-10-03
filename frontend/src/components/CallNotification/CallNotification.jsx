import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CallNotification.css"

export default function () {

    const [incomingCall, setIncomingCall] = useState(null);
    const nevigate = useNavigate();

    useEffect(() => {
        const storeUser = localStorage.getItem("user");

        if (!storeUser) return;

        let user;

        try {
            user = JSON.parse(storeUser);
        } catch {
            console.error("Invalid user data in localstorage");
            return;
        }

        const userId = user.id;

        if (!userId) {
            console.error("User ID not found");
            return;
        }

        const wsBase = "wss://connectx-bhpr.onrender.com";

        let socket;
        let retryTimer;
        let retryDelay = 1000;
        let stopped = false;

        const connect = () => {
            if (stopped) return;

            socket = new WebSocket(`${wsBase}/api/call/notification/${userId}`);

            socket.onopen = () => {
                console.log("Call notification connected");
                retryDelay = 1000;
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "incoming_call") {
                        setIncomingCall(data);
                    }

                    if (data.type === "call_ended") {
                        setIncomingCall((current) =>
                            current?.call_id === data.call_id ? null : current
                        );
                    }
                } catch (error) {
                    console.log("Invalid notification message", error);
                }
            };

            socket.onerror = (error) => {
                console.error("Notification websocket error", error);
            };

            socket.onclose = () => {
                if (stopped) return;
                console.log("Notification disconnected. Reconnecting...");

                retryTimer = setTimeout(connect, retryDelay);
                retryDelay = Math.min(retryDelay * 2, 30000);
            };
        };

        connect();

        return () => {
            stopped = true;
            clearTimeout(retryTimer);

            if (socket) {
                socket.close();
            }
        };
    }, []);

    if (!incomingCall) return null;

const acceptCall = () => {
    const callId = incomingCall.call_id;

    setIncomingCall(null);

    nevigate(`/video-call/${callId}`);
};

const rejectCall = () => {
    setIncomingCall(null);
}

return (
    <div className="call-notification-overlay">
        <div className="call-notification-card">
            <div className="call-notification-icon">📹</div>

            <h2>Incoming Video Call</h2>

            <p>
                <strong>{incomingCall.caller_name || "Someone"}</strong>
                {" "}is calling you.
            </p>

            <div className="call-notification-actions">
                <button className="accept-call" onClick={acceptCall}>
                    Accept
                </button>

                <button className="reject-call" onClick={rejectCall}>
                    Reject
                </button>
            </div>
        </div>
    </div>
);

}