import './Query4.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query4() {

  const [isFormVisible, setIsFormVisible] = useState(false); 

  const [times, setTimes] = useState({
    startTime: "",
    endTime: "",
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev); // Toggle Between Visibility and Invisibility
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
    setError(null); // Error Cleanup

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query4/', {
        params: {
          startTime: times.startTime,
          endTime: times.endTime,
        },
      });

      if (response.data.message) {
        setError(response.data.message); // Display Message if No Data Exists
      } else {
        setResults(response.data); // Display Results
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
    <div className='query4'>
      <div className='query4Box'>
      
        <div
          className='query4Up'
          onClick={toggleFormVisibility}
          style={{ cursor: 'pointer' }}
        >
          <span className='query4Desc'>
            4. Find the two least common crimes committed with regards to a given time range.
          </span>
        </div>
        <hr className='query4Line' />
        {/* Display Table */}
        {isFormVisible && (
          <>
            <form className='query4Form' onSubmit={handleSubmit}>

              <div className='query4Middle'>
                <div className='startTime'>
                  <label htmlFor="startTime">Start Time</label>
                  <input className='startTimeInput' type="time" id="startTime" name="startTime" value={times.startTime} onChange={handleChange} />
                </div>
                <div className='endTime'>
                  <label htmlFor="endTime">End Time</label>
                  <input className='endTimeInput' type="time" id="endTime" name="endTime" value={times.endTime} onChange={handleChange} />
                </div>
              </div>
  
              {!results.length > 0 &&(
                <div className='query4Down'>
                <button type="submit" className='query4SubmitButton'>Submit</button>
              </div>)}

            </form>
           
            {error && <div className='query4Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query4Results'>
                <h4 className='query4ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Crime Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{Array.isArray(result._id) ? result._id.join(", ") : result._id}</td> {/* Handle both cases */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query4SubmitButton">Reset</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
