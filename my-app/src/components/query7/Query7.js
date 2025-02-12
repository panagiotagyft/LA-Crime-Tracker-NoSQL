import './Query7.css';
import React, { useState } from "react";
import axios from "axios";


export default function Query7() {
  
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
        const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query7/');

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
    <div className='query7'>

      <div className='query7Box'>
        
        <div className='query7Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query7Desc'>7. Find the fifty most active police officers, with regard to the total number of upvotes.</span>
        </div>

        <hr className='query7Line' />
        {isFormVisible && (
          <>
            {!results.length > 0 &&(
            <form className='query7Down' onSubmit={handleSubmit}>
                <button type="submit" className='query7SubmitButton'>Submit</button>
            </form>
            )}
            
           {error && <div className='query7Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query7Results'>
                <h4 className='query7ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Badge Number</th>
                        <th>Total Upvotes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result.name}</td>
                          <td>{result.badge_number}</td>
                          <td>{result.total_upvotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query7SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}
