import './Query6.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query6() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [date, setDate] = useState("");

  const handleChange = (e) => {
    setDate(e.target.value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query6/', {
        params: { date: date },
      });

      if (response.data.message) {
        setError(response.data.message);
      } else {
        setResults(response.data); 
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  const handleReset = () => {
    setDate({
      Date: "",
    });
 
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query6'>
      <div className='query6Box'>
        <div className='query6Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query6Desc'>6. Find the fifty most upvoted reports for a specific day.</span>
        </div>
        <hr className='query6Line' />
        {isFormVisible && (
          <>
            
            <form className='query6Form' onSubmit={handleSubmit}>
              <div className='query6Middle'>
              <div className='selectDate'>
                  <label htmlFor="date">Date</label>
                  <input className='dateInput' type="date" id="date" name="date" value={date} onChange={handleChange} />
                </div>
              </div>
              {!results.length > 0 && (
                <div className='query6Down'>
                  <button type="submit" className='query6SubmitButton'>Submit</button>
                </div>
              )}
              </form>

            {error && <div className='query6Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query6Results'>
                <h4 className='query6ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                           <td>{result.dr_no}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query1SubmitButton">Reset</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
