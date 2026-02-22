import { useState } from "react";

const API_BASE_URL = "https://campuskitchen-production.up.railway.app";

function ChangePass() {
    const [curr, setCurr] = useState("");
    const [pass, setPass] = useState("");
    const [result, setResult] = useState("");

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setResult("");

        try {
            const response = await fetch(`${API_BASE_URL}/change_pass`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ curr, pass }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult("Password changed successfully!");
                setCurr("");
                setPass("");
            } else {
                setResult(data.error || "Password cannot be changed");
            }
        } catch (error) {
            console.error(error);
            setResult("Something went wrong. Try again.");
        }
    };

    return (
        <div>
            <h1>Change Password</h1>

            <p>
                Current Password{" "}
                <input
                    type="password"
                    value={curr}
                    onChange={(e) => setCurr(e.target.value)}
                />
            </p>

            <p>
                New Password{" "}
                <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                />
            </p>

            <button onClick={handleOnSubmit}>Submit</button>

            <h2>{result}</h2>
        </div>
    );
}

export default ChangePass;