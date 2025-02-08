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
        DateRptd: "",
        DateOcc: "",
        TimeOcc: "",
        AreaCode: "",
        AreaDesc: "",
        PremisCd: "",
        PremisesDesc: "",
        CrmCd: "",
        Crime_codeDesc: "",
        CrmCd2: "",
        CrmCd3: "",
        CrmCd4: "",
        WeaponUsedCd: "",
        WeaponDesc: "",
        Location: "",
        Latitude: "",
        Longitude: "",
        CrossStreet: "",
        Status: "",
        StatusDesc: "",
        RptDistNo: "",
        Mocodes: "",
        VictAge: "",
        VictSex: "",
        VictDescent: "",
    });

    const [options, setOptions] = useState({
        area_codes: [],
        crime_codes: [],
        premises: [],
        weapons: [],
        statuses: [],
        rpt_dists: [],
        victims_sex: [],
        victims_descent: [],
    });

    const [editableFields, setEditableFields] = useState({
        AreaDesc: false,
        Crime_codeDesc: false,
        PremisesDesc: false,
        WeaponDesc: false,
        StatusDesc: false,
    });

    const [isCustomCode, setIsCustomCode] = useState({
        Area: false,
        Crime_code: false,
        CrmCdCustom2: false,
        CrmCdCustom3: false,
        CrmCdCustom4: false,
        Premises: false,
        Weapon: false,
        Status: false,
        RptDistNo: false,
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


    const loadRecordData = (drNo) => {
        axios.get(`http://127.0.0.1:8000/api/db_manager/get-record/?dr_no=${drNo}`)
            .then((response) => {
                const data = response.data;
                setFormData((prevData) => ({
                    ...prevData,
                    ...data, // Update all fields with the data from the backend.
                }));
            })
            .catch((error) => {
                console.error("Error fetching record data:", error);
                alert("Failed to fetch record data.");
            });
    };

    const handleDrNoChange = (e) => {
        const drNo = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            DR_NO: drNo,
        }));
        if (drNo) {
            loadRecordData(drNo); // It loads the data for the selected DR_NO.
        }
    };

    const handleCodeChange = (e, type) => {
        const codeValue = e.target.value;

        const codeKeyMap = {
            "Area": "AreaCode",
            "Crime_code": "CrmCd",
            "Premises": "PremisCd",
            "Weapon": "WeaponUsedCd",
            "Status": "Status",
        };

        const descKeyMap = {
            "Area": "AreaDesc",
            "Crime_code": "Crime_codeDesc",
            "Premises": "PremisesDesc",
            "Weapon": "WeaponDesc",
            "Status": "StatusDesc",
        };

        const codeKey = codeKeyMap[type];
        const descKey = descKeyMap[type];

        if (codeValue === "custom") {
            // User selected to enter a custom code and description
            setIsCustomCode((prev) => ({
                ...prev,
                [type]: true,
            }));
            setFormData((prevData) => ({
                ...prevData,
                [codeKey]: '', // Clear code field to allow user input
                [descKey]: '', // Clear description field
            }));
            setEditableFields((prevFields) => ({
                ...prevFields,
                [`${type}Desc`]: true,
            }));
        } else {
            setIsCustomCode((prev) => ({
                ...prev,
                [type]: false,
            }));
            // Update formData with the selected code
            setFormData((prevData) => ({
                ...prevData,
                [codeKey]: codeValue,
                [descKey]: '', // Reset description
            }));
            // Record changes.
            setChangesLog((prevLog) => ({
                ...prevLog,
                [codeKey]: codeValue,
            }));

            if (codeValue) {
                axios.get("http://127.0.0.1:8000/api/db_manager/get-code-description/", {
                    params: { type, code: codeValue },
                })
                .then((response) => {
                    setFormData((prevData) => ({
                        ...prevData,
                        [descKey]: response.data.description,
                    }));
                    // Record changes.
                    setChangesLog((prevLog) => ({
                        ...prevLog,
                        [descKey]: response.data.description,
                    }));
                    setEditableFields((prevFields) => ({
                        ...prevFields,
                        [`${type}Desc`]: false,
                    }));
                })
                .catch((error) => {
                    if (error.response && error.response.status === 404) {
                        setFormData((prevData) => ({
                            ...prevData,
                            [descKey]: "",
                        }));
                        setEditableFields((prevFields) => ({
                            ...prevFields,
                            [`${type}Desc`]: true,
                        }));
                    }
                });
            } else {
                setEditableFields((prevFields) => ({
                    ...prevFields,
                    [`${type}Desc`]: false,
                }));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        
        if (name === "RptDistNo" && value === "custom") {
            setIsCustomCode((prev) => ({ ...prev, RptDistNo: true }));
            setFormData((prevData) => ({ ...prevData, RptDistNo: "" }));
        }

        setChangesLog((prevLog) => {
            console.log("Previous changesLog:", prevLog);
            const updatedLog = {
                ...prevLog,
                [name]: value,
            };
            console.log("Updated changesLog:", updatedLog);
            return updatedLog;
        });
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Changes to be updated:", changesLog);

        const payload = {
            DR_NO: formData.DR_NO, // Addition of DR_NO
            ...changesLog,         // Incorporation of Changes
        };
        console.log(Object.keys(changesLog))
        if (Object.keys(changesLog).length === 0) {
            alert("Please make some changes before submitting.");
            return;
        }

        axios.post("http://127.0.0.1:8000/api/db_manager/update-record/", payload)
            .then((response) => {
                alert("Update successful");
            })
            .catch((error) => {
                console.error("Error during update:", error);
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
                            handleDrNoChange(e); // Load the Data for DR_NO
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
                                    handleDrNoChange({ target: { value: dr } }); // Load Data for the Selected DR_NO
                                    setSearchResults([]); 
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {dr}
                            </li>
                        ))}
                    </ul>
                </div>


                                    
                    {/* --- DateRptd --- */}
                    <div className="formField">
                        <label htmlFor="DateRptd">Date Rptd</label>
                        <input id="DateRptd" name="DateRptd" value={formData.DateRptd} onChange={handleChange} type="date"/>
                    </div>
                    </div>

                    {/* ===== 2nd ROW ==== */}
                    <div className="formRow">

                    {/* --- DateOcc --- */}
                    <div className="formField">
                        <label htmlFor="DateOcc">DATE OCC</label>
                        <input id="DateOcc" name="DateOcc" value={formData.DateOcc} onChange={handleChange} type="date"/>
                    </div>
                    
                    {/* --- TimeOcc --- */}
                    <div className="formField">
                        <label htmlFor="TimeOcc">TIME OCC</label>
                        <input id="TimeOcc" name="TimeOcc" value={formData.TimeOcc} onChange={handleChange} type="time"/>
                    </div>
                    </div>

                    {/* Dropdown for Area Code */}
                    <div className="formRow">
                    <div className="formField">
                        <label htmlFor="AreaCode">Area Code</label>
                        <select
                            id="AreaCode"
                            name="AreaCode"
                            value={isCustomCode.Area ? "custom" : formData.AreaCode}
                            onFocus={() => handleFocus("area_codes")}
                            onChange={(e) => {
                                handleCodeChange(e, "Area");
                            }}
                        >
                        <option value="">Select Area Code</option>
                        {options.area_codes.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                        <option value="custom">Other (Add New)</option>
                        </select>
                        {isCustomCode.Area && (
                            <input
                                type="text"
                                name="AreaCode"
                                placeholder="Enter new Area Code"
                                value={formData.AreaCode}
                                onChange={handleChange}
                            />
                        )}
                    </div>
 
                    {/* --- Area Name --- */}
                    <div className="formField">
                        <label htmlFor="AreaDesc">Area Name</label>
                        {(editableFields.AreaDesc || isCustomCode.Area) ? (
                            <input
                                type="text"
                                id="AreaDesc"
                                name="AreaDesc"
                                placeholder="Enter new Area Name"
                                value={formData.AreaDesc}
                                onChange={handleChange}
                            />
                        ) : (
                            <input
                                type="text"
                                id="AreaDesc"
                                name="AreaDesc"
                                value={formData.AreaDesc}
                                readOnly
                            />
                        )}
                    </div>
                    </div>
                            
                    <div className="formRow">
                        {/* --- Crime Code --- */}
                        <div className="formField">
                            <label htmlFor="CrmCd">Crime Code</label>
                            <select
                                id="CrmCdSelect"
                                name="CrmCdSelect"
                                value={isCustomCode.Crime_code ? "custom" : formData.CrmCd}
                                onFocus={() => handleFocus("crime_codes")}
                                onChange={(e) => handleCodeChange(e, "Crime_code")}
                            >
                                <option value="">Select Crime Code</option>
                                {options.crime_codes.map((crime, index) => (
                                    <option key={index} value={crime}>{crime}</option>
                                ))}
                                <option value="custom">Other (Add New)</option>
                            </select>
                            {isCustomCode.Crime_code && (
                                <input
                                    type="text"
                                    name="CrmCd"
                                    placeholder="Enter new Crime Code"
                                    value={formData.CrmCd}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* --- Crime Description --- */}
                        <div className="formField">
                            <label htmlFor="Crime_codeDesc">Crime Description</label>
                            {(editableFields.Crime_codeDesc || isCustomCode.Crime_code) ? (
                                <input
                                    type="text"
                                    id="Crime_codeDesc"
                                    name="Crime_codeDesc"
                                    placeholder="Enter new description"
                                    value={formData.Crime_codeDesc}
                                    onChange={handleChange}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id="Crime_codeDesc"
                                    name="Crime_codeDesc"
                                    value={formData.Crime_codeDesc}
                                    readOnly
                                />
                            )}
                    </div>
                    

                    <div className="formField">
                        <label htmlFor="CrmCd2">Crm Cd 2</label>
                        <select
                            id="CrmCd2"
                            name="CrmCd2"
                            value={isCustomCode.CrmCdCustom2 ? "custom" :formData.CrmCd2}   
                            onFocus={() => handleFocus("crime_codes")}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleChange(e);
                                if (value === "custom") {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom2: true }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd2: "" }));
                                } else {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom2: false }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd2: value }));
                                }
                            }}
                        >
                        <option value="">Select Crime Code</option>
                        {options.crime_codes.map((crime, index) => (
                            <option key={index} value={crime}>{crime}</option>
                        ))}
                        <option value="custom">Other (Add New)</option>
                        </select>
                        {isCustomCode.CrmCdCustom2 && (
                            <input
                                type="number"
                                name="CrmCdCustom2"
                                placeholder="Enter new Crime Code2"
                                value={formData.CrmCd2}
                                    onChange={(e) => {
                                    handleChange(e);
                                    const value = e.target.value;
                                    setFormData((prevData) => ({ ...prevData, CrmCd2: value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="formField">
                        <label htmlFor="CrmCd3">Crm Cd 3</label>
                        <select
                            id="CrmCd3"
                            name="CrmCd3"
                            value={isCustomCode.CrmCdCustom3 ? "custom" :formData.CrmCd3}   
                            onFocus={() => handleFocus("crime_codes")}
                            onChange={(e) => {
                                handleChange(e);
                                const value = e.target.value;
                                if (value === "custom") {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom3: true }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd3: "" }));
                                } else {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom3: false }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd3: value }));
                                }
                            }}
                        >
                        <option value="">Select Crime Code</option>
                        {options.crime_codes.map((crime, index) => (
                            <option key={index} value={crime}>{crime}</option>
                        ))}
                        <option value="custom">Other (Add New)</option>
                        </select>
                        {isCustomCode.CrmCdCustom3 && (
                            <input
                                type="number"
                                name="CrmCdCustom3"
                                placeholder="Enter new Rpt Dist No"
                                value={formData.CrmCd3}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleChange(e);
                                    setFormData((prevData) => ({ ...prevData, CrmCd3: value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="formField">
                        <label htmlFor="CrmCd4">Crm Cd 4</label>
                        <select
                            id="CrmCd4"
                            name="CrmCd4"
                            value={isCustomCode.CrmCdCustom4 ? "custom" :formData.CrmCd4}   
                            onFocus={() => handleFocus("crime_codes")}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleChange(e);
                                if (value === "custom") {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom4: true }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd4: "" }));
                                } else {
                                    setIsCustomCode((prev) => ({ ...prev, CrmCdCustom4: false }));
                                    setFormData((prevData) => ({ ...prevData, CrmCd4: value }));
                                }
                            }}
                        >
                        <option value="">Select Crime Code</option>
                        {options.crime_codes.map((crime, index) => (
                            <option key={index} value={crime}>{crime}</option>
                        ))}
                        <option value="custom">Other (Add New)</option>
                        </select>
                        {isCustomCode.CrmCdCustom4 && (
                            <input
                                type="number"
                                name="CrmCdCustom4"
                                placeholder="Enter new Rpt Dist No"
                                value={formData.CrmCd4}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prevData) => ({ ...prevData, CrmCd4: value }));
                                }}
                            />
                        )}
                    </div>
                    </div>
                    
                    <div className="formRow">
                        <div className="formField">
                            <label htmlFor="PremisCd">Premis Cd</label>
                            <select
                                id="PremisCdSelect"
                                name="PremisCdSelect"
                                value={isCustomCode.Premises ? "custom" : formData.PremisCd}
                                onFocus={() => handleFocus("premises")}
                                onChange={(e) => handleCodeChange(e, "Premises")}
                            >
                                <option value="">Select Premis Cd</option>
                                {options.premises.map((code, index) => (
                                    <option key={index} value={code}>{code}</option>
                                ))}
                                <option value="custom">Other (Add New)</option>
                            </select>
                            {isCustomCode.Premises && (
                                <input
                                    type="text"
                                    name="PremisCd"
                                    placeholder="Enter new Premis Cd"
                                    value={formData.PremisCd}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        <div className="formField">
                            <label htmlFor="PremisesDesc">Premis Desc</label>
                            {(editableFields.PremisesDesc || isCustomCode.Premises) ? (
                                <input
                                    type="text"
                                    id="PremisesDesc"
                                    name="PremisesDesc"
                                    placeholder="Enter new Premis Desc"
                                    value={formData.PremisesDesc}
                                    onChange={handleChange}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id="PremisesDesc"
                                    name="PremisesDesc"
                                    value={formData.PremisesDesc}
                                    readOnly
                                />
                            )}
                        </div>
                    </div>


                    <div className="formRow">
                        {/* --- Weapon Used Code --- */}
                        <div className="formField">
                            <label htmlFor="WeaponUsedCd">Weapon Used Code</label>
                            <select
                                id="WeaponUsedCdSelect"
                                name="WeaponUsedCdSelect"
                                value={isCustomCode.Weapon ? "custom" : formData.WeaponUsedCd}
                                onFocus={() => handleFocus("weapons")}
                                onChange={(e) => handleCodeChange(e, "Weapon")}
                            >
                                <option value="">Select Weapon Used Code</option>
                                {options.weapons.map((code, index) => (
                                    <option key={index} value={code}>{code}</option>
                                ))}
                                <option value="custom">Other (Add New)</option>
                            </select>
                            {isCustomCode.Weapon && (
                                <input
                                    type="text"
                                    name="WeaponUsedCd"
                                    placeholder="Enter new Weapon Used Code"
                                    value={formData.WeaponUsedCd}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* --- Weapon Description --- */}
                        <div className="formField">
                            <label htmlFor="WeaponDesc">Weapon Description</label>
                            {(editableFields.WeaponDesc || isCustomCode.Weapon) ? (
                                <input
                                    type="text"
                                    id="WeaponDesc"
                                    name="WeaponDesc"
                                    placeholder="Enter new Weapon Description"
                                    value={formData.WeaponDesc}
                                    onChange={handleChange}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id="WeaponDesc"
                                    name="WeaponDesc"
                                    value={formData.WeaponDesc}
                                    readOnly
                                />
                            )}
                        </div>
                    </div>

                    <div className="formRow">
                    <div className="formField">
                        <label htmlFor="Location">Location</label>
                        <input
                        id="Location"
                        name="Location"
                        value={formData.Location}
                        onChange={handleChange}
                        type="text"
                        />
                    </div>
                    <div className="formField">
                        <label htmlFor="Latitude">Latitude</label>
                        <input
                        id="Latitude"
                        name="Latitude"
                        value={formData.Latitude}
                        onChange={handleChange}
                        type="number"
                        step="0.000001"
                        />
                    </div>
                    <div className="formField">
                        <label htmlFor="Longitude">Longitude</label>
                        <input
                        id="Longitude"
                        name="Longitude"
                        value={formData.Longitude}
                        onChange={handleChange}
                        type="number"
                        step="0.000001"
                        />
                    </div>
                    <div className="formField">
                        <label htmlFor="CrossStreet">Cross Street</label>
                        <input
                        id="CrossStreet"
                        name="CrossStreet"
                        value={formData.CrossStreet}
                        onChange={handleChange}
                        type="text"
                        />
                    </div>
                    </div>

                    <div className="formRow">
                        {/* --- Status Code --- */}
                        <div className="formField">
                            <label htmlFor="Status">Status</label>
                            <select
                                id="StatusSelect"
                                name="StatusSelect"
                                value={isCustomCode.Status ? "custom" : formData.Status}
                                onFocus={() => handleFocus("statuses")}
                                onChange={(e) => handleCodeChange(e, "Status")}
                            >
                                <option value="">Select Status</option>
                                {options.statuses.map((code, index) => (
                                    <option key={index} value={code}>{code}</option>
                                ))}
                                <option value="custom">Other (Add New)</option>
                            </select>
                            {isCustomCode.Status && (
                                <input
                                    type="text"
                                    name="Status"
                                    placeholder="Enter new Status"
                                    value={formData.Status}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* --- Status Description --- */}
                        <div className="formField">
                            <label htmlFor="StatusDesc">Status Description</label>
                            {(editableFields.StatusDesc || isCustomCode.Status) ? (
                                <input
                                    type="text"
                                    id="StatusDesc"
                                    name="StatusDesc"
                                    placeholder="Enter new Status Description"
                                    value={formData.StatusDesc}
                                    onChange={handleChange}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id="StatusDesc"
                                    name="StatusDesc"
                                    value={formData.StatusDesc}
                                    readOnly
                                />
                            )}
                        </div>
                    </div>


                    <div className="formRow">
                    <div className="formField">
                        <label htmlFor="RptDistNo">Rpt Dist No</label>
                        <select
                            id="RptDistNo"
                            name="RptDistNo"
                            value={isCustomCode.RptDistNo ? "custom" :formData.RptDistNo}   
                            onFocus={() => handleFocus("rpt_dists")}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleChange(e);
                                if (value === "custom") {
                                    setIsCustomCode((prev) => ({ ...prev, RptDistNo: true }));
                                    setFormData((prevData) => ({ ...prevData, RptDistNo: "" }));
                                } else {
                                    setIsCustomCode((prev) => ({ ...prev, RptDistNo: false }));
                                    setFormData((prevData) => ({ ...prevData, RptDistNo: value }));
                                }
                            }}
                        >
                        <option value="">Select Rpt Dist No</option>
                        {options.rpt_dists.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                        <option value="custom">Other (Add New)</option>
                        </select>
                        {isCustomCode.RptDistNo && (
                            <input
                                type="number"
                                name="RptDistNo"
                                placeholder="Enter new Rpt Dist No"
                                value={formData.RptDistNo}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleChange(e);
                                    setFormData((prevData) => ({ ...prevData, RptDistNo: value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="formField">
                        <label htmlFor="Mocodes">Mocodes</label>
                        <input
                            type="text"
                            name="Mocodes"
                            placeholder="Enter new Mocodes"
                            value={formData.Mocodes}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleChange(e);
                                setFormData((prevData) => ({ ...prevData, Mocodes: value }));
                            }}
                        />
                    </div>
                    </div>

                    <div className="formRow">
                    <div className="formField">
                        <label htmlFor="VictAge">Victim Age</label>                     
                        <input
                            type="number"
                            name="VictAge"
                            placeholder="Enter new Victim Age"
                            value={formData.VictAge}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="formField">
                        <label htmlFor="VictSex">Victim Sex</label>
                        <select
                            id="VictSex"
                            name="VictSex"
                            value={formData.VictSex}
                            onFocus={() => handleFocus("victims_sex")}
                            onChange={handleChange}
                        >
                        <option value="">Select Victim Sex</option>
                        {options.victims_sex.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                        </select>
                    </div>
                    <div className="formField">
                        <label htmlFor="VictDescent">Victim Descent</label>
                        <select
                            id="VictDescent"
                            name="VictDescent"
                            value={formData.VictDescent}
                            onFocus={() => handleFocus("victims_descent")}
                            onChange={handleChange}
                        >
                        <option value="">Select Victim Descent</option>
                        {options.victims_descent.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                        </select>
                    </div>
                    </div>

                    <button type="submit" className="submitButton">Submit</button>
                </form>
            </div>
        </div>
  );
}