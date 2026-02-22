import { useState } from "react";
//import { useNavigate } from "react-router-dom";
function ChangePass()
{
    const[curr, setCurr] = useState("");
    const[pass, setPass] = useState("");
    //const[confirm, setConfirm] = useState("");
    const[result, setResult] = useState("");
    //const navigate=useNavigate();

    const handleOnSubmit=async(e)=>{
        e.preventDefault();
        let result = await fetch(
            'http://localhost:5000/change_pass', {
                method: "post",
                body: JSON.stringify({curr, pass }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            console.log(result);
            
            if(result)
            {
                setResult("Data saved successfully!");
                setCurr("");
                setPass("");
            }
            else
            {
                setResult("Password cannot be changed");
            }
    };
    return(
          <div>
            <h1>Change Password</h1>
            <p>Current Password <input type="text" value={curr} onChange={(e)=>setCurr(e.target.value)}/></p>
            <p>Password <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} /></p>

            <p>
                <button type='submit' onClick={handleOnSubmit}>Submit</button>
            </p>

            <h2>{result}</h2>
        </div>
    )
}
export default ChangePass;