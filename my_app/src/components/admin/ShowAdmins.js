import axios from "axios";
import { Link } from "react-router-dom";
import React, { useState} from "react";

function ShowAdmins() {
    const [admins, setAdmins] = useState([]);
    const displayAdmins = async () => {
        try {
            const res = await axios.get('http://localhost:5000/show_admins');
            setAdmins(res.data);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }


    };
    return (
        <div style={{ margin: 10 }}>



            <h4>All Administators</h4>
            
            <button onClick={displayAdmins} >Show All</button>
            
            <div className="row">
                <div className="col-2">Name</div>
                <div className="col-2">Address</div>
                <div className="col-2">Contact</div>
                <div className="col-2">Email</div>
                <div className="col-2"></div>
                <div className="col-2"></div>
            </div>
            {admins.map((admin)=>(
                <div className="row" key={admin.email}>
                <div className="col-2">{admin.name}</div>
                <div className="col-2">{admin.address}</div>
                <div className="col-2">{admin.contact}</div>
                <div className="col-2">{admin.email}</div>
                <div className="col-2">
                    <a className="btn btn-success m-1" href={'/edit_admin/'+admin.email}>Edit</a>
                </div>
                <div className="col-2">
                <Link className="btn btn-danger m-1">Delete</Link>
                </div>
            </div>
            ))}

            
        </div>
            

            );
}

            export default ShowAdmins;

