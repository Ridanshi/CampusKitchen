import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Search() {
    const location = useLocation();
    const medname = location.state?.medname;

    const [medid, setMedid] = useState("");
    const [name, setName] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        if (medname) {
            displaySearch(medname);
        }
    }, [medname]);

    const displaySearch = async (searchName) => {
        try {
            let response = await fetch('http://localhost:5000/get_med', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ medname: searchName }),
            });

            let data = await response.json();
            console.log(data);

            if (data._id) {
                setMedid(data._id);
                setName(data.medname);
                setResult("Medicine found!");
            } else {
                setResult(data.msg || "No record found.");
            }
        } catch (error) {
            console.error("Error fetching medicine:", error);
            setResult("Server error occurred.");
        }
    };

    return (
        <div style={{ margin: 10 }}>
            <h4 className="text-primary">Change and Save</h4>
            <form>
                <div className="form-group">
                    <label>Id</label>
                    <input
                        type="text"
                        readOnly
                        className="form-control"
                        value={medid}
                    />
                </div>
                <div className="col-6">
                    <div className="form-group">
                        <label>Medicine Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            readOnly
                        />
                    </div>
                </div>
            </form>
            <p>{result}</p>
        </div>
    );
}

export default Search;
