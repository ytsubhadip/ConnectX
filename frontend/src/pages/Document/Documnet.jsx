import { useEffect, useState } from "react";
import API from "../../service/API";
import "./Document.css";

function Document() {

    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedDocument, setSelectedDocument] = useState(null);


    // ============================
    // USER
    // ============================

    let storedUser = null;

    try {
        storedUser = JSON.parse(
            localStorage.getItem("user")
        );
    } catch (err) {
        console.log("Invalid user data");
    }

    const userId = storedUser?.user?.id;


    // ============================
    // FILE CHANGE
    // ============================

    const handleFileChange = (event) => {

        console.log("FILE CHANGE FUNCTION CALLED");

        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        console.log("Selected file:", selectedFile);


        // Check PDF

        if (
            selectedFile.type !==
            "application/pdf"
        ) {

            setError(
                "Only PDF files are allowed."
            );

            setFile(null);

            event.target.value = "";

            return;
        }


        // Check file size

        const maxSize =
            10 * 1024 * 1024;

        if (selectedFile.size > maxSize) {

            setError(
                "PDF must be less than 10 MB."
            );

            setFile(null);

            event.target.value = "";

            return;
        }


        // Save file

        setError("");
        setMessage("");

        setFile(selectedFile);
    };


    // ============================
    // GET DOCUMENTS
    // ============================

    const getDocuments = async () => {

        if (!userId) {

            setError(
                "User ID not found. Please login again."
            );

            setLoading(false);

            return;
        }

        try {

            setLoading(true);

            const response = await API.get(
                "/api/document/",
                {
                    params: {
                        user_id: userId
                    }
                }
            );

            setDocuments(
                response.data.documents || []
            );

        } catch (err) {

            console.error(
                "Get documents error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Failed to load documents."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================
    // USE EFFECT
    // ============================

    useEffect(() => {

        getDocuments();

    }, [userId]);


    // ============================
    // UPLOAD
    // ============================

    const handleUpload = async () => {

        if (!file) {

            setError(
                "Please select a PDF first."
            );

            return;
        }

        if (!userId) {

            setError(
                "User ID not found."
            );

            return;
        }

        try {

            setUploading(true);

            setError("");
            setMessage("");


            const formData =
                new FormData();


            formData.append(
                "user_id",
                userId
            );


            formData.append(
                "file",
                file
            );


            const response =
                await API.post(
                    "/api/document/upload",
                    formData
                );


            console.log(
                "Upload response:",
                response.data
            );


            setMessage(
                "Document uploaded successfully."
            );


            setFile(null);


            const input =
                document.getElementById(
                    "document-file"
                );

            if (input) {
                input.value = "";
            }


            // Reload documents

            await getDocuments();

        } catch (err) {

            console.error(
                "Upload error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Document upload failed."
            );

        } finally {

            setUploading(false);
        }
    };


    // ============================
    // SELECT DOCUMENT
    // ============================

    const handleSelectDocument = (
        document
    ) => {

        setSelectedDocument(
            document
        );

    };


    // ============================
    // RETURN
    // ============================

    return (

        <div className="document-page">


            <h1>
                My Documents
            </h1>


            {/* ERROR */}

            {error && (

                <div className="document-error">
                    {error}
                </div>

            )}


            {/* SUCCESS */}

            {message && (

                <div className="document-success">
                    {message}
                </div>

            )}


            {/* =====================
                UPLOAD
            ====================== */}

            <div className="upload-card">

                <h2>
                    Upload Document
                </h2>


                <p>
                    Upload your PDF document.
                </p>


                <div className="upload-controls">


                    {/* IMPORTANT */}

                    <input
                        id="document-file"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                    />


                    {file && (

                        <p>
                            Selected:
                            {" "}
                            {file.name}
                        </p>

                    )}


                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={
                            !file ||
                            uploading
                        }
                    >

                        {uploading
                            ? "Uploading..."
                            : "Upload Document"
                        }

                    </button>

                </div>

            </div>


            {/* =====================
                PREVIOUS DOCUMENTS
            ====================== */}

            <div className="previous-documents">

                <h2>
                    Previous Documents
                </h2>


                {loading && (

                    <p>
                        Loading documents...
                    </p>

                )}


                {!loading &&
                    documents.length === 0 && (

                    <p>
                        No documents found.
                    </p>

                )}


                {!loading &&
                    documents.length > 0 && (

                    <div className="document-grid">

                        {documents.map(
                            (document) => (

                            <div
                                className="document-card"
                                key={
                                    document.document_id
                                }
                            >

                                <h3>
                                    {
                                        document.file_name
                                    }
                                </h3>

                                <p>
                                    Pages:{" "}
                                    {
                                        document.pages
                                    }
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleSelectDocument(
                                            document
                                        )
                                    }
                                >

                                    {selectedDocument
                                        ?.document_id ===
                                    document.document_id

                                        ? "Selected"

                                        : "Select"
                                    }

                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>


        </div>

    );
}

export default Document;