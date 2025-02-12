import './Query9.css';
import React, { useState, useEffect } from "react";
import axios from "axios";


export default function Query9() {
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clearing previous errors.

    try {
        const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query9/');

      if (response.data.message) {
        setError(response.data.message); // Display a message if no data is available.
      } else {
        setResults(response.data); // Display results.
      }

    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  const handleReset = () => {
  
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query9'>

      <div className='query9Box'>
        
        <div className='query9Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query9Desc'>9.  Find all reports for which the same e-mail has been used for more than one badge numbers when casting an upvote.</span>
        </div>

        <hr className='query9Line' />
        {isFormVisible && (
          <>
            {!results.length > 0 &&(
            <form className='query9Down' onSubmit={handleSubmit}>
                <button type="submit" className='query9SubmitButton'>Submit</button>
            </form>
            )}
            
           {error && <div className='query9Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query9Results'>
                <h4 className='query9ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Badge Numbers</th>
                        <th>DR_NO List</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          {/* Εμφάνιση email */}
                          <td>{result.email}</td>

                          {/* Εμφάνιση uniqueBadgeNumbers με κόμματα */}
                          <td>{Array.isArray(result.uniqueBadgeNumbers) ? result.uniqueBadgeNumbers.join(", ") : result.uniqueBadgeNumbers}</td>

                          {/* Εμφάνιση allDrNos κάθετα */}
                          <td style={{ 
                            minWidth: "150px",
                            maxHeight: "250px",  // Περιορισμός ύψους
                            overflowY: "auto",  // Κάθετη κύλιση
                            display: "block"  // Επιτρέπει το overflow να λειτουργήσει σωστά
                          }}>
                            <ul style={{ margin: 0, padding: 0 }}>
                              {Array.isArray(result.allDrNos) ? result.allDrNos.slice(0, 50).map((dr_no, i) => (  // Περιορίζουμε σε 50 για εμφάνιση
                                <li key={i} style={{ listStyleType: "none" }}>{dr_no}</li>
                              )) : <li>{result.allDrNos}</li>}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query9SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}
