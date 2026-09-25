import { useState, useEffect } from "react";
import API from "../../service/API";
import "./Wallet.css";

function Wallet() {

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getTransactions();
    }, []);

    const getTransactions = async () => {

        try {

            const userData = localStorage.getItem("user");

            if (!userData) {
                setError("Please login first");
                setLoading(false);
                return;
            }

            const user = JSON.parse(userData);

            console.log("User:", user);

            const response = await API.get(
                "/api/subscription/wallet/transactions",
                {
                    params: {
                        user_id: user.user.id
                    }
                }
            );

            console.log("Transactions:", response.data);

            setTransactions(response.data);

        }
        catch (error) {

            console.log("Transaction Error:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to load transaction history"
            );

        }
        finally {
            setLoading(false);
        }
    };


    // Loading UI
    if (loading) {
        return (
            <div className="wallet-page">
                <h2>Loading transactions...</h2>
            </div>
        );
    }


    // Main UI
    return (

        <div className="wallet-page">

            <div className="wallet-container">

                <div className="wallet-header">

                    <h1>Wallet History</h1>

                    <p>
                        View all your wallet transactions
                    </p>

                </div>


                {error && (
                    <div className="wallet-error">
                        {error}
                    </div>
                )}


                {transactions.length === 0 ? (

                    <div className="no-transactions">

                        <h2>No Transactions Yet</h2>

                        <p>
                            Your wallet transactions will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="transaction-list">

                        {transactions.map((transaction) => (

                            <div
                                className="transaction-card"
                                key={transaction.id}
                            >

                                <div className="transaction-left">

                                    <div className="transaction-icon">
                                        +
                                    </div>

                                    <div>
                                        <p>
                                            {transaction.transation_type}
                                        </p>
                                    </div>

                                </div>


                                <div className="transaction-right">

                                    <strong>
                                        +{transaction.amount} Credits
                                    </strong>

                                    <span>
                                        {new Date(
                                            transaction.created_at
                                        ).toLocaleString()}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Wallet;