import './Query5.css';
import React, { useState } from "react";
import axios from "axios";


export default function Query5() {
  
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
        const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query5/');

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
    <div className='query5'>

      <div className='query5Box'>
        
        <div className='query5Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query5Desc'>5. Find the types of weapon that have been used for the same crime “Crm Cd” in more than one areas.</span>
        </div>

        <hr className='query5Line' />
        {isFormVisible && (
          <>
            {!results.length > 0 &&(
            <form className='query5Down' onSubmit={handleSubmit}>
                <button type="submit" className='query5SubmitButton'>Submit</button>
            </form>
            )}
            
           {error && <div className='query5Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query5Results'>
                <h4 className='query5ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
                    <thead>
                      <tr>
                        <th>Crime Code</th>
                        <th>Weapons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results
                        .sort((a, b) => a.crime_cd - b.crime_cd) 
                        .map((result, index) => (
                          <tr key={index}>
                            <td>{result.crime_cd}</td>
                            <td>
                              <div className="weaponsList">  
                                <ul>
                                  {result.weapons.map((weapon, i) => (
                                    <li key={i}>{weapon}</li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query5SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}
