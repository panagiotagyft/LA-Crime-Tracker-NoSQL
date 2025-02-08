import './Query12.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query12() {
  const [isFormVisible, setIsFormVisible] = useState(false); 
  const [times, setTimes] = useState({
    startTime: "",
    endTime: "",
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTimes((prevTimes) => ({
      ...prevTimes,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query12/', {
        params: {
          startTime: times.startTime,
          endTime: times.endTime,
        },
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

    setTimes({
      startTime: "",
      endTime: "",
    });
  
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query12'>
      <div className='query12Box'>

        <div
          className='query12Up'
          onClick={toggleFormVisibility}
          style={{ cursor: 'pointer' }}
        >
          <span className='query12Desc'>
           12. Find the number of division of records for crimes reported on the same day in different areas using the same weapon for a specific time range.
          </span>
        </div>
        <hr className='query12Line' />
        {isFormVisible && (
          <>
            <form className='query12Form' onSubmit={handleSubmit}>

              <div className='query12Middle'>
                <div className='startTime'>
                  <label htmlFor="startTime">Start Time</label>
                  <input className='startTimeInput' type="time" id="startTime" name="startTime" value={times.startTime} onChange={handleChange} />
                </div>
                <div className='endTime'>
                  <label htmlFor="endTime">End Time</label>
                  <input className='endTimeInput' type="time" id="endTime" name="endTime" value={times.endTime} onChange={handleChange} />
                </div>
              </div>
  
              {results.length === 0 && (
                <div className='query12Down'>
                  <button type="submit" className='query12SubmitButton'>Submit</button>
                </div>
              )}

            </form>
           
            {error && <div className='query12Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query12Results'>
                <h4 className='query12ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Reported day</th>
                        <th>Weapon code</th>
                        <th>Number of division of records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["Reported day"]}</td>
                          <td>{result["Weapon code"]}</td>
                          <td>{result["Number of division of records"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query12SubmitButton">Reset</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
