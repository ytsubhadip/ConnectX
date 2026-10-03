import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../service/API";
import "./VideoCall.css";

function VideoCall() {
    const { callId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Caller information passed from the start-call page
    const isCaller = location.state?.isCaller === true;

    // -----------------------------------------
    // VIDEO REFERENCES
    // -----------------------------------------

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // -----------------------------------------
    // WEBRTC / WEBSOCKET REFERENCES
    // -----------------------------------------

    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const websocketRef = useRef(null);

    // ICE candidates that arrive before
    // remote description
    const pendingCandidatesRef = useRef([]);

    // Messages that arrive before WebSocket opens
    const pendingMessagesRef = useRef([]);

    // Prevent duplicate initialization
    const startedRef = useRef(false);

    // -----------------------------------------
    // STATE
    // -----------------------------------------

    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // INITIALIZE CALL
    // =====================================================

    useEffect(() => {
        if (startedRef.current) {
            return;
        }

        startedRef.current = true;

        let cancelled = false;

        const initializeCall = async () => {
            try {
                setLoading(true);
                setError("");

                if (!callId) {
                    throw new Error("Call ID is missing.");
                }

                console.log(
                    "Starting video call:",
                    callId
                );

                console.log(
                    "Caller:",
                    isCaller
                );

                await startVideoCall(cancelled);

            } catch (error) {
                console.error(
                    "Failed to start video call:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error?.message ||
                        "Failed to start video call."
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        initializeCall();

        return () => {
            cancelled = true;
            cleanupCall();
        };

    }, [callId]);


    // =====================================================
    // START VIDEO CALL
    // =====================================================

    const startVideoCall = async (cancelled) => {

        // -----------------------------------------
        // CHECK BROWSER SUPPORT
        // -----------------------------------------

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            throw new Error(
                "Camera and microphone are not supported."
            );
        }

        if (!window.isSecureContext) {
            throw new Error(
                "Camera requires HTTPS or localhost."
            );
        }


        // -----------------------------------------
        // GET CAMERA + MICROPHONE
        // -----------------------------------------

        const stream =
            await getLocalMedia();


        if (cancelled) {

            stopStream(stream);

            return;
        }


        localStreamRef.current = stream;


        // -----------------------------------------
        // SHOW LOCAL VIDEO
        // -----------------------------------------

        if (localVideoRef.current) {

            localVideoRef.current.srcObject =
                stream;

            try {

                await localVideoRef.current.play();

            } catch (error) {

                console.log(
                    "Local video play:",
                    error
                );
            }
        }


        console.log(
            "Local media stream ready."
        );


        // -----------------------------------------
        // CREATE PEER CONNECTION
        // -----------------------------------------

        const peerConnection =
            new RTCPeerConnection({

                iceServers: [
                    {
                        urls:
                            "stun:stun.l.google.com:19302"
                    }
                ]

            });


        peerConnectionRef.current =
            peerConnection;


        // -----------------------------------------
        // ADD LOCAL TRACKS
        // -----------------------------------------

        stream
            .getTracks()
            .forEach((track) => {

                peerConnection.addTrack(
                    track,
                    stream
                );

            });


        // -----------------------------------------
        // RECEIVE REMOTE TRACK
        // -----------------------------------------

        peerConnection.ontrack = (event) => {

            console.log(
                "Remote track received."
            );


            if (
                remoteVideoRef.current &&
                event.streams[0]
            ) {

                remoteVideoRef.current.srcObject =
                    event.streams[0];


                remoteVideoRef.current
                    .play()
                    .catch(() => {});

            }
        };


        // -----------------------------------------
        // ICE CANDIDATE
        // -----------------------------------------

        peerConnection.onicecandidate = (
            event
        ) => {

            if (!event.candidate) {
                return;
            }


            sendSignal({

                type: "candidate",

                candidate:
                    event.candidate.toJSON()

            });

        };


        // -----------------------------------------
        // WEBRTC STATE
        // -----------------------------------------

        peerConnection.onconnectionstatechange =
            () => {

                const state =
                    peerConnection.connectionState;


                console.log(
                    "WebRTC connection state:",
                    state
                );


                if (state === "connected") {

                    setConnected(true);

                }


                if (
                    state === "failed" ||
                    state === "disconnected" ||
                    state === "closed"
                ) {

                    setConnected(false);

                }
            };


        // -----------------------------------------
        // ICE STATE
        // -----------------------------------------

        peerConnection.oniceconnectionstatechange =
            () => {

                console.log(
                    "ICE connection state:",
                    peerConnection
                        .iceConnectionState
                );

            };


        // =================================================
        // WEBSOCKET
        // =================================================

        const wsBaseUrl =
            
            "https://connectx-bhpr.onrender.com";


        const websocketUrl =
            `${wsBaseUrl}/api/call/ws/${callId}`;


        console.log(
            "Connecting WebSocket:",
            websocketUrl
        );


        const websocket =
            new WebSocket(websocketUrl);


        websocketRef.current =
            websocket;


        // -----------------------------------------
        // WEBSOCKET OPEN
        // -----------------------------------------

        websocket.onopen = () => {

            console.log(
                "WebSocket connected."
            );


            const queuedMessages =
                pendingMessagesRef.current;


            pendingMessagesRef.current = [];


            queuedMessages.forEach(
                (message) => {

                    websocket.send(
                        JSON.stringify(message)
                    );

                }
            );

        };


        // -----------------------------------------
        // WEBSOCKET MESSAGE
        // -----------------------------------------

        websocket.onmessage =
            async (event) => {

                try {

                    const message =
                        JSON.parse(
                            event.data
                        );


                    console.log(
                        "WebSocket message:",
                        message
                    );


                    await handleSignalingMessage(
                        message
                    );


                } catch (error) {

                    console.error(
                        "Error handling signaling message:",
                        error
                    );

                }
            };


        // -----------------------------------------
        // WEBSOCKET ERROR
        // -----------------------------------------

        websocket.onerror = (error) => {

            console.error(
                "WebSocket error:",
                error
            );


            setError(
                "Could not connect to video call server."
            );

        };


        // -----------------------------------------
        // WEBSOCKET CLOSE
        // -----------------------------------------

        websocket.onclose = () => {

            console.log(
                "WebSocket disconnected."
            );


            setConnected(false);

        };
    };


    // =====================================================
    // GET CAMERA + MICROPHONE
    // =====================================================

    const getLocalMedia = async () => {

        console.log(
            "Checking available cameras..."
        );


        let devices;


        try {

            devices =
                await navigator.mediaDevices
                    .enumerateDevices();

        } catch (error) {

            console.error(
                "Cannot enumerate devices:",
                error
            );


            throw new Error(
                "Cannot access camera devices."
            );
        }


        const cameras =
            devices.filter(
                (device) =>
                    device.kind ===
                    "videoinput"
            );


        console.log(
            "Available cameras:",
            cameras
        );


        if (cameras.length === 0) {

            throw new Error(
                "No camera was found."
            );
        }


        let cameraStream = null;
        let microphoneStream = null;


        // -----------------------------------------
        // CAMERA
        // -----------------------------------------

        try {

            const cameraId =
                cameras[0].deviceId;


            console.log(
                "Trying camera:",
                cameras[0].label ||
                "Camera"
            );


            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            deviceId: {
                                exact:
                                    cameraId
                            },

                            width: {
                                ideal: 1280
                            },

                            height: {
                                ideal: 720
                            },

                            frameRate: {
                                ideal: 30
                            }
                        },

                        audio: false

                    });


        } catch (error) {

            console.warn(
                "Selected camera failed:",
                error
            );


            // Fallback
            try {

                cameraStream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            video: true,

                            audio: false

                        });

            } catch (fallbackError) {

                handleMediaError(
                    fallbackError
                );
            }
        }


        console.log(
            "Camera started successfully."
        );


        // -----------------------------------------
        // MICROPHONE
        // -----------------------------------------

        try {

            microphoneStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: false,

                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }

                    });


            console.log(
                "Microphone started successfully."
            );


        } catch (error) {

            stopStream(
                cameraStream
            );


            handleMediaError(error);
        }


        // -----------------------------------------
        // COMBINE CAMERA + MIC
        // -----------------------------------------

        const combinedStream =
            new MediaStream([

                ...cameraStream
                    .getVideoTracks(),

                ...microphoneStream
                    .getAudioTracks()

            ]);


        return combinedStream;
    };


    // =====================================================
    // MEDIA ERROR
    // =====================================================

    const handleMediaError = (error) => {

        console.error(
            "Media error:",
            error.name,
            error.message
        );


        if (
            error.name ===
            "NotReadableError"
        ) {

            throw new Error(
                "Camera is already being used by another application."
            );
        }


        if (
            error.name ===
            "NotAllowedError"
        ) {

            throw new Error(
                "Camera or microphone permission was denied."
            );
        }


        if (
            error.name ===
            "NotFoundError"
        ) {

            throw new Error(
                "Camera or microphone was not found."
            );
        }


        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "Camera startup was interrupted."
            );
        }


        throw new Error(
            error.message ||
            "Could not start camera or microphone."
        );
    };


    // =====================================================
    // SEND SIGNAL
    // =====================================================

    const sendSignal = (message) => {

        const websocket =
            websocketRef.current;


        if (
            websocket &&
            websocket.readyState ===
                WebSocket.OPEN
        ) {

            websocket.send(
                JSON.stringify(message)
            );

        } else {

            pendingMessagesRef.current.push(
                message
            );
        }
    };


    // =====================================================
    // HANDLE SIGNALING
    // =====================================================

    const handleSignalingMessage =
        async (message) => {

            const peerConnection =
                peerConnectionRef.current;


            if (!peerConnection) {
                return;
            }


            // =================================================
            // PEER JOINED
            // =================================================

            if (
                message.type ===
                "peer_joined"
            ) {

                console.log(
                    "Peer joined."
                );


                setConnected(true);


                // Only caller creates offer
                if (isCaller) {

                    // Make sure we are stable
                    if (
                        peerConnection
                            .signalingState !==
                        "stable"
                    ) {

                        console.log(
                            "Not creating offer. Current state:",
                            peerConnection
                                .signalingState
                        );

                        return;
                    }


                    console.log(
                        "Creating offer..."
                    );


                    try {

                        const offer =
                            await peerConnection
                                .createOffer();


                        await peerConnection
                            .setLocalDescription(
                                offer
                            );


                        // IMPORTANT:
                        // Do NOT use offer.toJSON()

                        sendSignal({

                            type: "offer",

                            offer: {

                                type:
                                    offer.type,

                                sdp:
                                    offer.sdp

                            }

                        });


                        console.log(
                            "Offer sent."
                        );


                    } catch (error) {

                        console.error(
                            "Offer creation failed:",
                            error
                        );

                    }
                }


                return;
            }


            // =================================================
            // OFFER RECEIVED
            // =================================================

            if (
                message.type ===
                "offer"
            ) {

                console.log(
                    "Offer received."
                );


                // Receiver should normally be stable
                if (
                    peerConnection
                        .signalingState !==
                    "stable"
                ) {

                    console.log(
                        "Ignoring offer. Current signaling state:",
                        peerConnection
                            .signalingState
                    );

                    return;
                }


                try {

                    // -----------------------------------------
                    // SET REMOTE OFFER
                    // -----------------------------------------

                    await peerConnection
                        .setRemoteDescription(

                            new RTCSessionDescription(
                                message.offer
                            )

                        );


                    // -----------------------------------------
                    // ADD QUEUED ICE
                    // -----------------------------------------

                    await addPendingCandidates();


                    // -----------------------------------------
                    // CREATE ANSWER
                    // -----------------------------------------

                    const answer =
                        await peerConnection
                            .createAnswer();


                    // -----------------------------------------
                    // SET LOCAL ANSWER
                    // -----------------------------------------

                    await peerConnection
                        .setLocalDescription(
                            answer
                        );


                    // IMPORTANT:
                    // Do NOT use answer.toJSON()

                    sendSignal({

                        type: "answer",

                        answer: {

                            type:
                                answer.type,

                            sdp:
                                answer.sdp

                        }

                    });


                    console.log(
                        "Answer sent."
                    );


                } catch (error) {

                    console.error(
                        "Error processing offer:",
                        error
                    );

                }


                return;
            }


            // =================================================
            // ANSWER RECEIVED
            // =================================================

            if (
                message.type ===
                "answer"
            ) {

                console.log(
                    "Answer received."
                );


                // Answer should only be accepted
                // after caller created local offer
                if (
                    peerConnection
                        .signalingState !==
                    "have-local-offer"
                ) {

                    console.log(
                        "Ignoring answer. Current state:",
                        peerConnection
                            .signalingState
                    );

                    return;
                }


                try {

                    await peerConnection
                        .setRemoteDescription(

                            new RTCSessionDescription(
                                message.answer
                            )

                        );


                    await addPendingCandidates();


                    console.log(
                        "Answer applied."
                    );


                } catch (error) {

                    console.error(
                        "Error processing answer:",
                        error
                    );

                }


                return;
            }


            // =================================================
            // ICE CANDIDATE
            // =================================================

            if (
                message.type ===
                "candidate"
            ) {

                const candidate =
                    new RTCIceCandidate(
                        message.candidate
                    );


                // If remote description already exists
                if (
                    peerConnection
                        .remoteDescription
                ) {

                    try {

                        await peerConnection
                            .addIceCandidate(
                                candidate
                            );

                    } catch (error) {

                        console.error(
                            "ICE candidate error:",
                            error
                        );
                    }


                } else {

                    // Save candidate until
                    // remote description exists

                    pendingCandidatesRef
                        .current
                        .push(candidate);
                }


                return;
            }


            // =================================================
            // PEER LEFT
            // =================================================

            if (
                message.type ===
                "peer_left"
            ) {

                console.log(
                    "Peer left."
                );


                setConnected(false);


                if (
                    remoteVideoRef.current
                ) {

                    remoteVideoRef.current
                        .srcObject = null;

                }
            }
        };


    // =====================================================
    // ADD PENDING ICE CANDIDATES
    // =====================================================

    const addPendingCandidates =
        async () => {

            const peerConnection =
                peerConnectionRef.current;


            if (!peerConnection) {
                return;
            }


            const candidates =
                pendingCandidatesRef.current;


            pendingCandidatesRef.current =
                [];


            for (
                const candidate
                of candidates
            ) {

                try {

                    await peerConnection
                        .addIceCandidate(
                            candidate
                        );

                } catch (error) {

                    console.error(
                        "Failed to add ICE candidate:",
                        error
                    );
                }
            }
        };


    // =====================================================
    // MICROPHONE CONTROL
    // =====================================================

    const toggleMicrophone = () => {

        const stream =
            localStreamRef.current;


        if (!stream) {
            return;
        }


        const audioTrack =
            stream.getAudioTracks()[0];


        if (!audioTrack) {
            return;
        }


        audioTrack.enabled =
            !audioTrack.enabled;


        setMicEnabled(
            audioTrack.enabled
        );
    };


    // =====================================================
    // CAMERA CONTROL
    // =====================================================

    const toggleCamera = () => {

        const stream =
            localStreamRef.current;


        if (!stream) {
            return;
        }


        const videoTrack =
            stream.getVideoTracks()[0];


        if (!videoTrack) {
            return;
        }


        videoTrack.enabled =
            !videoTrack.enabled;


        setCameraEnabled(
            videoTrack.enabled
        );
    };


    // =====================================================
    // END CALL
    // =====================================================

    const endCall = async () => {

        try {

            await API.post(
                `/api/call/end/${callId}`
            );

        } catch (error) {

            console.error(
                "Failed to end call:",
                error
            );
        }


        cleanupCall();


        navigate("/dashboard");
    };


    // =====================================================
    // STOP STREAM
    // =====================================================

    const stopStream = (stream) => {

        if (!stream) {
            return;
        }


        stream
            .getTracks()
            .forEach((track) => {

                track.stop();

            });
    };


    // =====================================================
    // CLEANUP
    // =====================================================

    const cleanupCall = () => {

        console.log(
            "Cleaning up call..."
        );


        // -----------------------------------------
        // STOP CAMERA + MIC
        // -----------------------------------------

        if (localStreamRef.current) {

            stopStream(
                localStreamRef.current
            );

            localStreamRef.current =
                null;
        }


        // -----------------------------------------
        // CLOSE WEBRTC
        // -----------------------------------------

        if (peerConnectionRef.current) {

            peerConnectionRef.current.close();

            peerConnectionRef.current =
                null;
        }


        // -----------------------------------------
        // CLOSE WEBSOCKET
        // -----------------------------------------

        if (websocketRef.current) {

            const websocket =
                websocketRef.current;


            if (
                websocket.readyState ===
                    WebSocket.OPEN ||
                websocket.readyState ===
                    WebSocket.CONNECTING
            ) {

                websocket.close();
            }


            websocketRef.current =
                null;
        }


        // -----------------------------------------
        // CLEAR QUEUES
        // -----------------------------------------

        pendingCandidatesRef.current =
            [];

        pendingMessagesRef.current =
            [];


        // -----------------------------------------
        // CLEAR VIDEO
        // -----------------------------------------

        if (localVideoRef.current) {

            localVideoRef.current.srcObject =
                null;
        }


        if (remoteVideoRef.current) {

            remoteVideoRef.current.srcObject =
                null;
        }


        setConnected(false);
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="video-call-container">

            {/* HEADER */}

            <div className="video-call-header">

                <div>

                    <h2>
                        ConnectX Video Call
                    </h2>

                    <span>
                        {connected
                            ? "Connected"
                            : "Waiting for user..."}
                    </span>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="video-call-error">

                    ⚠️ {error}

                </div>

            )}


            {/* LOADING */}

            {loading && (

                <div className="video-call-loading">

                    Starting camera and microphone...

                </div>

            )}


            {/* VIDEO AREA */}

            <div className="video-area">

                {/* REMOTE VIDEO */}

                <div className="remote-video-wrapper">

                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="remote-video"
                    />

                    {!connected && (

                        <div className="waiting-message">

                            <div>
                                👤
                            </div>

                            <h2>
                                Waiting for user to join...
                            </h2>

                        </div>

                    )}

                </div>


                {/* LOCAL VIDEO */}

                <div className="local-video-wrapper">

                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="local-video"
                    />

                    <span>
                        You
                    </span>

                </div>

            </div>


            {/* CONTROLS */}

            <div className="call-controls">

                <button
                    onClick={
                        toggleMicrophone
                    }
                    className="control-button"
                >

                    {micEnabled
                        ? "🎤 Mute"
                        : "🔇 Unmute"}

                </button>


                <button
                    onClick={
                        toggleCamera
                    }
                    className="control-button"
                >

                    {cameraEnabled
                        ? "📹 Camera Off"
                        : "📷 Camera On"}

                </button>


                <button
                    onClick={endCall}
                    className="end-call-button"
                >

                    🔴 End Call

                </button>

            </div>

        </div>
    );
}

export default VideoCall;