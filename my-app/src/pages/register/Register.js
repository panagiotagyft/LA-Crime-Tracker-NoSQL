import './Register.css';
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const [error, setError] = useState(null);
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const redirect = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prev) => ({
            ...prev,
            [name]: value || "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Basic validation
        if (inputs.password !== inputs.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/api/users/register/", inputs, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            redirect("/");
        }  catch (error) {
            if (error.response) {
                const errorData = error.response.data;
                let errorMessage = "";

                Object.keys(errorData).forEach((key) => {
                    const value = errorData[key];
                    if (Array.isArray(value)) {
                        errorMessage += `${key}: ${value.join(", ")}\n`;
                    } else {
                        errorMessage += `${key}: ${value}\n`;
                    }
                });

                setError(errorMessage.trim());
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
        }
    };

    return (
        <div className='register'>
            <div className='registerWrapper'>
                <form className="registerBox" onSubmit={handleSubmit}>
                    <input name="username" placeholder="Username" className="registerInput" onChange={handleChange} />
                    <input name="email" type="email" placeholder="e-mail address" className="registerInput" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" className="registerInput" onChange={handleChange} />
                    <input name="confirm_password" type="password" placeholder="Confirm Password" className="registerInput" onChange={handleChange} />
                    
                    {error && <div className="error">{error}</div>}
                    <button className='registerButton' type="submit">Register</button>
                    <div className="registerFooter">
                        <span className="registerText">Already have an account?</span>
                        <Link to="/login"><button className="registerLoginButton">Log In</button></Link>
                    </div>
                </form>
            </div>  
        </div>
    );
}
