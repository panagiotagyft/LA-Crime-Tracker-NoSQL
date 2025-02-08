
import './Query7.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query7() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDates((prevDates) => ({
      ...prevDates,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query7/', {
        params: {
          startDate: dates.startDate,
          endDate: dates.endDate
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
    setDates({
      startDate: "",
      endDate: "",
    });
 
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };


  return (
    <div className='query7'>
      <div className='query7Box'>
        <div className='query7Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query7Desc'>7. Find the pair of crimes that has co-occurred in the area with the most reported incidents for a specific date range.</span>
        </div>
        <hr className='query7Line' />
        {isFormVisible && (
          <>
            <form className='query7Form' onSubmit={handleSubmit}>
              <div className='query7Middle'>
                <div className='startDate'>
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    className='startDateInput'
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dates.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className='endDate'>
                  <label htmlFor="endDate">End Date</label>
                  <input
                    className='endDateInput'
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dates.endDate}
                    onChange={handleChange}
                  />
                </div>
                </div>
                {!results.length > 0 && (
                  <div className='query7Down'>
                    <button type="submit" className='query7SubmitButton'>Submit</button>
                  </div>
                )}
              </form>


            {error && <div className='query7Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query7Results'>
                <h4 className='query7ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Crime 1</th>
                        <th>Crime 2</th>
                        <th>Pair Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["Crime 1"]}</td>
                          <td>{result["Crime 2"]}</td>
                          <td>{result["Pair Count"]}</td>
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
  );
}
