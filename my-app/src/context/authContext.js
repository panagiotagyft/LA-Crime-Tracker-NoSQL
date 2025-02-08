import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
        return user;
    });

    const login = async (inputs) => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/users/login/", inputs, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200 && response.data) {
                const token = response.data.token;
                const user = { username: inputs.username };
                setCurrentUser(user);
                Cookies.set('user', JSON.stringify(user));
                Cookies.set('token', token); // Αποθήκευση του token
                return user;
            } else {
                throw new Error("Login failed");
            }
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        }
    };

    const logout = () => {
        Cookies.remove('user');
        Cookies.remove('token');
        setCurrentUser(null);
    };

    useEffect(() => {
        if (currentUser) {
            Cookies.set('user', JSON.stringify(currentUser));
        } else {
            Cookies.remove('user');
        }
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
