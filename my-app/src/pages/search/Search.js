import './Search.css';
import React, { useState } from "react";
import axios from 'axios';
import UserNavbar from '../../components/navbar/UserNavbar';

export default function Search() {

    const userEmail = 'user@example.com';

    const handleLogout = () => {
        console.log('User logged out');
    };

    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // Τρέχουσα σελίδα
    const [totalPages, setTotalPages] = useState(1); // Συνολικές σελίδες

    const [area, setArea] = useState({ area_name: "" });
    const [options, setOptions] = useState({
        area_names: [],
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setArea((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); 
        setLoading(true);

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/db_manager/search/', {
                params: {
                    area_name: area.area_name,
                    page: page, // Στέλνουμε την τρέχουσα σελίδα στο backend
                },
            });

            if (response.data.message) {
                setError(response.data.message); 
                setResults([]);
            } else {
                setResults(response.data.results); 
                setTotalPages(response.data.pages); // Ορίζουμε τον αριθμό σελίδων από το backend
            }
        } catch (err) {
            setError(err.response?.data?.error || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (newPage) => {
        setPage(newPage); // Αλλάζουμε την τρέχουσα σελίδα
        setError(null);
        setLoading(true);

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/db_manager/search/', {
                params: {
                    area_name: area.area_name,
                    page: newPage, // Στέλνουμε τη νέα σελίδα στο backend
                },
            });

            setResults(response.data.results);
        } catch (err) {
            setError("An error occurred while changing pages.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setArea({
            area_name: "",
        });
        setResults([]);
        setError(null);
        setPage(1); // Επαναφορά στην πρώτη σελίδα
    };
  
    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        const maxVisiblePages = 5;

        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Previous
                </button>
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className={currentPage === page ? "active" : ""}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        );
    };


    return (
        <div className={`search ${results.length > 0 ? 'search-with-results' : 'search-no-results'}`}>
            <UserNavbar userEmail={userEmail} onLogout={handleLogout} />
            <div className="search-bar">
                <form className="searchForm" onSubmit={handleSubmit}>
                    <label htmlFor="searchAreaName">Area</label>
                    <select
                        className="searchAreaName"
                        id="area_name"
                        name="area_name"
                        placeholder="Select Area"
                        value={area.area_name}
                        onFocus={() => handleFocus("area_names")}
                        onChange={handleChange}>
                        <option value="" disabled>Select Area</option>
                        {options.area_names?.map((code, index) => (
                            <option key={index} value={code}>{code}</option>
                        ))}
                    </select>
                    {!results.length > 0 && (
                        <div className='searchSubmit'>
                            <button type="submit" className='searchSubmitButton'>Submit</button>
                        </div>
                    )}
                </form>
            </div>
            {error && <div className='searchError'>{error}</div>}
            {loading && <div className="loading">Loading...</div>}

            {results.length > 0 && (
                <div className="searchResults">
                    <h4 className="searchResultsTitle">Results:</h4>
                    <div className="resultsTableWrapper">
                        <table className="resultsTable">
                            <thead>
                                <tr>
                                    <th>DR_NO</th>
                                    <th>Date Rptd</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Status Desc</th>
                                    <th>Premis code</th>
                                    <th>Premis code desc</th>
                                    <th>rpt_dist_no</th>
                                    <th>Area ID</th>
                                    <th>Area Name</th> 
                                    <th>Loacation ID</th>
                                    <th>Location</th>
                                    <th>Latitude</th>
                                    <th>Longtitude</th>
                                    <th>Cross Street</th>
                                    <th>Mocodes</th>
                                    <th>Weapon Code</th>
                                    <th>Weapon code desc</th>
                                    <th>Crime code 1</th>
                                    <th>Crime code 1 desc</th>    
                                    <th>Crime code 2</th> 
                                    <th>Crime code 3</th> 
                                    <th>Crime code 4</th> 
                                    <th>Victim ID </th> 
                                    <th>Victim age</th> 
                                    <th>Victim sex </th> 
                                    <th>Victim descent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index}>
                                        <td>{result["DR_NO"]}</td>
                                        <td>{result["Date Rptd"]}</td>
                                        <td>{result["Date"]}</td>
                                        <td>{result["Time"]}</td>
                                        <td>{result["Status"]}</td>
                                        <td>{result["Status Desc"]}</td>
                                        <td>{result["Premis code"]}</td>
                                        <td>{result["Premis code desc"]}</td>
                                        <td>{result["rpt_dist_no"]}</td>
                                        <td>{result["Area ID"]}</td>
                                        <td>{result["Area Name"]}</td>
                                        <td>{result["Loacation ID"]}</td>
                                        <td>{result["Location"]}</td>
                                        <td>{result["Latitude"]}</td>
                                        <td>{result["Longtitude"]}</td>
                                        <td>{result["Cross Street"]}</td>
                                        <td>{result["Mocodes"]}</td>
                                        <td>{result["Weapon Code"]}</td>
                                        <td>{result["Weapon code desc"]}</td>
                                        <td>{result["Crime code 1"]}</td>
                                        <td>{result["Crime code 1 desc"]}</td>
                                        <td>{result["Crime code 2"]}</td>
                                        <td>{result["Crime code 3"]}</td>
                                        <td>{result["Crime code 4"]}</td>  
                                        <td>{result["Victim ID"]}</td>
                                        <td>{result["Victim age"]}</td>
                                        <td>{result["Victim sex"]}</td>
                                        <td>{result["Victim descent"]}</td> 
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => handlePageChange(newPage)}
                />
            )}

            {results.length > 0 && (
                <button onClick={handleReset} className="searchSubmitButton">Reset</button>
            )}     
        </div>
    );
}