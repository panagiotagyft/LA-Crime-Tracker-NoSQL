import './Query8.css';
import React, { useState } from "react";
import axios from "axios";


export default function Query8() {
  
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
        const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query8/');

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
    <div className='query8'>

      <div className='query8Box'>
        
        <div className='query8Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query8Desc'>8.  Find the top fifty police officers, with regard to the total number of areas for which they have upvoted reports.</span>
        </div>

        <hr className='query8Line' />
        {isFormVisible && (
          <>
            {!results.length > 0 &&(
            <form className='query8Down' onSubmit={handleSubmit}>
                <button type="submit" className='query8SubmitButton'>Submit</button>
            </form>
            )}
            
           {error && <div className='query8Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query8Results'>
                <h4 className='query8ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Badge Number</th>
                        <th>Total Distinct Areas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result.officerName}</td>
                          <td>{result.badgeNumber}</td>
                          <td>{result.totalDistinctAreas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query8SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}
