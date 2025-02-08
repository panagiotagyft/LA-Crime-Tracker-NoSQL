import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/authContext';

export default function Login() {
    const { login } = useContext(AuthContext);
    const [inputs, setInputs] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(inputs);
            navigate('/home'); // Ή οπουδήποτε θέλεις να ανακατευθύνεις μετά το login
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className='login'>
            <div className='loginWrapper'>
                <form className="loginBox" onSubmit={handleSubmit}>
                    <input
                        name="username"
                        placeholder="Username"
                        className="loginInput"
                        onChange={handleChange}
                        value={inputs.username}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="loginInput"
                        onChange={handleChange}
                        value={inputs.password}
                    />
                    <button className='loginButton' type="submit">Log In</button>
                    {error && <div className="error">{error}</div>}
                    <div className="loginFooter">
                        <span className="loginText">Don't have an account?</span>
                        <Link to="/register">
                            <button className="loginRegisterButton">Sign Up</button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
