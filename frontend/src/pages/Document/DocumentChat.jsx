import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import API from "../../service/API";
import "./DocumentChat.css";


function DocumentChat() {

    // =========================
    // DOCUMENT ID
    // =========================

    const { documentId } = useParams();

    const navigate = useNavigate();


    // =========================
    // STATES
    // =========================

    const [question, setQuestion] = useState("");

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "ai",
            text: "Hi! Ask me anything about this document."
        }
    ]);

    const [loading, setLoading] = useState(false);


    // =========================
    // SEND QUESTION
    // =========================

    const handleSend = async () => {

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
            return;
        }


        // =========================
        // GET USER FROM LOCALSTORAGE
        // =========================

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {

            console.error("User not found in localStorage");

            const errorMessage = {
                id: Date.now(),
                type: "ai",
                text: "User information not found. Please login again."
            };

            setMessages((previous) => [
                ...previous,
                errorMessage
            ]);

            return;
        }


        // Convert JSON string → object
        const userData = JSON.parse(storedUser);

        console.log("User data:", userData);


        // =========================
        // USER MESSAGE
        // =========================

        const userMessage = {
            id: Date.now(),
            type: "user",
            text: trimmedQuestion
        };

        setMessages((previous) => [
            ...previous,
            userMessage
        ]);


        // Clear input
        setQuestion("");

        // Start loading
        setLoading(true);


        // =========================
        // SEND TO BACKEND
        // =========================

        try {


            const response = await API.post(
                "/api/document/ask",
                {
                    document_id: documentId,
                    question: trimmedQuestion
                }
            );


            console.log("Backend response:", response.data);


            // =========================
            // AI MESSAGE
            // =========================

            const aiMessage = {
                id: Date.now() + 1,
                type: "ai",
                text: response.data.answer
            };


            setMessages((previous) => [
                ...previous,
                aiMessage
            ]);


        } catch (error) {

            console.error(
                "Ask document error:",
                error
            );


            const errorMessage = {
                id: Date.now() + 1,
                type: "ai",
                text:
                    error.response?.data?.detail ||
                    "Sorry, I could not answer your question."
            };


            setMessages((previous) => [
                ...previous,
                errorMessage
            ]);


        } finally {

            setLoading(false);

        }

    }; // ⭐ IMPORTANT: handleSend ENDS HERE


    // =========================
    // ENTER KEY
    // =========================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    // =========================
    // PAGE
    // =========================

    return (

        <div className="chat-container">


            {/* =========================
                CHAT HEADER
            ========================= */}

            <div className="chat-header">

                <div className="chat-document">

                    <div className="chat-pdf-icon">
                        PDF
                    </div>


                    <div>

                        <h2>
                            Document Chat
                        </h2>

                        <p>
                            Document ID: {documentId}
                        </p>

                    </div>

                </div>


                {/* Back button */}

                <button
                    type="button"
                    className="close-chat"
                    onClick={() => navigate("/document")}
                >
                    ← Back
                </button>

            </div>


            {/* =========================
                CHAT MESSAGES
            ========================= */}

            <div className="chat-message">

                {messages.map((msg) => (

                    <div
                        key={msg.id}
                        className={
                            msg.type === "user"
                                ? "message-row user-message-row"
                                : "message-row ai-message-row"
                        }
                    >


                        {/* AI Avatar */}

                        {msg.type === "ai" && (

                            <div className="message-avatar">
                                AI
                            </div>

                        )}


                        {/* Message */}

                        <div
                            className={
                                msg.type === "user"
                                    ? "message user-message"
                                    : "message ai-message"
                            }
                        >

                            {/* <p>
                                {msg.text}
                            </p> */}

                            <div className="message-text">
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>
                            </div>

                        </div>


                        {/* User Avatar */}

                        {msg.type === "user" && (

                            <div className="message-avatar user-avatar">
                                You
                            </div>

                        )}

                    </div>

                ))}


                {/* =========================
                    AI TYPING
                ========================= */}

                {loading && (

                    <div className="message-row ai-message-row">

                        <div className="message-avatar">
                            AI
                        </div>


                        <div className="message ai-message typing-message">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    </div>

                )}

            </div>


            {/* =========================
                INPUT AREA
            ========================= */}

            <div className="chat-input-area">

                <textarea
                    value={question}
                    onChange={(event) =>
                        setQuestion(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about this document..."
                    rows={1}
                    disabled={loading}
                />


                <button
                    type="button"
                    className="send-button"
                    onClick={handleSend}
                    disabled={
                        !question.trim() ||
                        loading
                    }
                >

                    {loading
                        ? "..."
                        : "Send"
                    }

                </button>

            </div>


            {/* =========================
                FOOTER
            ========================= */}

            <div className="chat-footer">

                AI answers are generated from the
                selected document.

            </div>

        </div>

    );

}


export default DocumentChat;