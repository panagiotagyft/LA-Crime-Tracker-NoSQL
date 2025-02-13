import './Updates.css';
import React, { useState } from "react";
import axios from "axios";
import UserNavbar from '../../components/navbar/UserNavbar'; 

export default function Updates() {

    const userEmail = 'user@example.com';

    const handleLogout = () => {
        console.log('User logged out');
    };

    const [changesLog, setChangesLog] = useState({});
        
    const [formData, setFormData] = useState({
        DR_NO: "",
        badge_number: "",
    });

    const [options, setOptions] = useState({
        badge_numbers: [],
    });

    const fetchOptions = (type) => {
        axios.get("http://127.0.0.1:8000/api/db_manager/dropdown-options/", {
            params: { type },
        })
        .then((response) => {
            const newOptions = response.data[type] || [];
            setOptions((prev) => ({
                ...prev,
                [type]: newOptions,
            }));
        })
        .catch((error) => console.error(`Error fetching ${type} options:`, error));
    };


    const handleFocus = (type) => {
        if (options[type].length === 0) {
            fetchOptions(type, true); 
        }
    };

    const handleCodeChange = (e) => {
        const selectedBadge = e.target.value;

        // Update the selected badge number in formData
        setFormData((prevData) => ({
            ...prevData,
            badge_number: selectedBadge
        }));

        if (selectedBadge) {
            axios.get("http://127.0.0.1:8000/api/db_manager/get-user-details/", {
                params: { badge_number: selectedBadge },
            })
            .then((response) => {
                if (response.data) {
                    setFormData((prevData) => ({
                        ...prevData,
                        Name: response.data.name || "",  // Auto-fill Name
                        Email: response.data.email || "" // Auto-fill Email
                    }));
                }
            })
            .catch((error) => console.error("Error fetching user details:", error));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Changes to be updated:", changesLog);

        const payload = {
            DR_NO: formData.DR_NO, // DR_NO submission
            BADGE_NO: formData.badge_number, 
            ...changesLog,         // Other changes
        };

        axios.post("http://127.0.0.1:8000/api/db_manager/update-record/", payload)
            .then((response) => {
                alert("Update successful");  // Show success alert

                // Clear form data after clicking OK
                setFormData({
                    DR_NO: "",
                    badge_number: "",
                    Name: "",
                    Email: ""
                });

                setChangesLog({}); // Clear changes log

            })
            .catch((error) => {
                console.error("Error during update:", error);

                // Check if the error response contains "DR_NO already voted by this officer"
                if (error.response && error.response.data.error === "DR_NO already voted by this officer") {
                    alert("DR_NO already voted by this officer");  // Show alert to user
                } else {
                    alert("An error occurred while updating the record.");
                }
            });
    };

    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (query) => {
        if (query.length > 2) { // Search After 3 Characters
            axios.get(`http://127.0.0.1:8000/api/db_manager/search-dr-numbers/`, {
                params: { query }
            })
                .then((response) => {
                    setSearchResults(response.data.dr_numbers || []);
                })
                .catch((error) => console.error("Error searching DR_NO:", error));
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className="updates">
            <UserNavbar userEmail={userEmail} onLogout={handleLogout} />
                <h2 className='updatesTitle'>Updates</h2>
                <div className="updatesFormContainer">
                <form className="updatesForm" onSubmit={handleSubmit}>

                <div className="formRow">
                    <div className="formField">
                        <label htmlFor="BadgeNumber">Badge Number</label>
                        <select
                            id="BadgeNumber"
                            name="BadgeNumber"
                            onFocus={() => handleFocus("badge_numbers")}
                            onChange={handleCodeChange}
                        >
                        <option value="">Select Badge Number</option>
                        {options.badge_numbers.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                        </select>
                    </div>
 
                    {/* Name Field */}
                    <div className="formField">
                        <label htmlFor="Name">Name</label>
                        <input
                            type="text"
                            id="Name"
                            name="Name"
                            value={formData.Name || ""} // Correct state field
                            readOnly
                        />
                    </div>

                    {/* Email Field */}
                    <div className="formField">
                        <label htmlFor="Email">Email</label>
                        <input
                            type="text"
                            id="Email"
                            name="Email"
                            value={formData.Email || ""} // Correct state field
                            readOnly
                        />
                    </div>

                        
                </div>
                
                <div className="formRow">
                    
                    {/* --- DR_NO --- */}
                
                    <div className="formField">
                    <label htmlFor="DR_NO">DR_NO</label>
                    <input
                        type="text"
                        id="DR_NO"
                        name="DR_NO"
                        value={formData.DR_NO || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({ ...prev, DR_NO: value })); // Update DR_NO
                            handleSearch(value); // Initiate Search for Dropdown
                        }}
                        placeholder="Search DR_NO"
                    />
                    <ul className="dropdown">
                        {searchResults.map((dr, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setFormData((prev) => ({ ...prev, DR_NO: dr })); // select DR_NO
                                    setSearchResults([]); 
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {dr}
                            </li>
                        ))}
                    </ul>
                </div>

                    </div>

                    <button type="submit" className="submitButton">Submit</button>
                </form>
            </div>
        </div>
  );
}