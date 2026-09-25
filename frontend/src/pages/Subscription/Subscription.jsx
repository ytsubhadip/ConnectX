import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../service/API";
import "./Subscription.css";

function Subscription() {

    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // Get subscription plans
    useEffect(() => {
        getPlans();
    }, []);


    const getPlans = async () => {

        try {

            const response = await API.get(
                "/api/subscription/plans"
            );

            console.log("Plans:", response.data);

            setPlans(response.data);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.detail ||
                "Unable to load subscription plans"
            );

        } finally {

            setLoading(false);

        }
    };


    // Subscribe to plan
    const handleSubscribe = async (planId) => {

        setError("");
        setSuccess("");
        setSubscribing(true);

        try {

            const userData = localStorage.getItem("user");

            if (!userData) {

                setError("Please Login first");
                return;

            }

            const user = JSON.parse(userData);

            console.log("User:", user);


            const response = await API.post(
                `/api/subscription/subscribe/${planId}`,
                null,
                {
                    params: {
                        user_id: user.user.id
                    }
                }
            );


            console.log(
                "Subscription:",
                response.data
            );


            setSuccess(
                `Subscription successful! ${response.data.credits_add} credits added to your wallet.`
            );

            setTimeout(() => {
                navigate("/profile");
            }, 1000);


        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.detail ||
                "Subscription failed"
            );

        } finally {

            setSubscribing(false);

        }
    };


    // Loading
    if (loading) {

        return (
            <div className="subscription-page">

                <h2>
                    Loading plans...
                </h2>

            </div>
        );

    }


    // UI
    return (

        <div className="subscription-page">

            <div className="subscription-container">

                <div className="subscription-header">

                    <h1>
                        Choose Your Plan
                    </h1>

                    <p>
                        Select a subscription plan and get
                        credits instantly.
                    </p>

                </div>


                {/* Error */}

                {error && (
                    <div className="subscription-error">
                        {error}
                    </div>
                )}


                {/* Success */}

                {success && (
                    <div className="subscription-success">
                        {success}
                    </div>
                )}


                {/* Plans */}

                <div className="plans-container">

                    {plans.length === 0 ? (

                        <p>
                            No subscription plans available.
                        </p>

                    ) : (

                        plans.map((plan) => (

                            <div
                                className="plan-card"
                                key={plan.id}
                            >

                                <h2>
                                    {plan.name}
                                </h2>


                                <div className="plan-price">

                                    <span>
                                        ₹
                                    </span>

                                    {plan.price}

                                </div>


                                <div className="plan-credits">

                                    {plan.credits}

                                    <span>
                                        Credits
                                    </span>

                                </div>


                                <p className="plan-description">

                                    {plan.description}

                                </p>


                                <button
                                    className="subscribe-btn"
                                    disabled={subscribing}
                                    onClick={() =>
                                        handleSubscribe(plan.id)
                                    }
                                >

                                    {subscribing
                                        ? "Processing..."
                                        : "Subscribe"
                                    }

                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    );
}

export default Subscription;