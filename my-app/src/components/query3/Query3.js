import './Query3.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query3() {
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
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query3/', {
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
    <div className='query3'>
      <div className='query3Box'>
        <div className='query3Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query3Desc'>3. Find the most common crime committed regardless of code 1, 2, 3, and 4, per area for a specific day.</span>
        </div>
        <hr className='query3Line' />
        {isFormVisible && (
          <>
            
            <form className='query3Form' onSubmit={handleSubmit}>
              <div className='query3Middle'>
              <div className='selectDate'>
                  <label htmlFor="date">Date</label>
                  <input className='dateInput' type="date" id="date" name="date" value={date} onChange={handleChange} />
                </div>
              </div>
              {!results.length > 0 && (
                <div className='query3Down'>
                  <button type="submit" className='query3SubmitButton'>Submit</button>
                </div>
              )}
              </form>

            {error && <div className='query3Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query3Results'>
                <h4 className='query3ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Area Code</th>
                        <th>The most frequent crime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["Area Code"]}</td>
                          <td>{result["The most frequent crime"]}</td>
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
