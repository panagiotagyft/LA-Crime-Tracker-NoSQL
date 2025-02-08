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
          <span className='query9Desc'>9. Find the most common type of weapon used against victims depending on their group of age.The age groups are formed by bucketing ages every 5 years.</span>
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
                        <th>Age Group</th>
                        <th>Most common weapon</th>
                        <th>Occurrence Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["Age Group"]}</td>
                          <td>{result["Most common weapon"]}</td>
                          <td>{result["Occurrence Count"]}</td>
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
