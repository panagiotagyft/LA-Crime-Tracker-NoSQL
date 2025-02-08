import './Query4.css';
import React, { useState } from "react";
import axios from "axios";

export default function Query4() {
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
    setError(null); // Clearing previous errors.
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query4/', {
        params: {
          startDate: dates.startDate,
          endDate: dates.endDate,
        },
      });

      if (response.data.avg_number_of_crimes_per_hour) {
          setResults([response.data]); // Store the scalar result as a single object
      } else {
          setError("No data available for the given time range.");
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
    <div className='query4'>
      <div className='query4Box'>
        <div className='query4Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query4Desc'>4.Find the average number of crimes occurred per hour (24 hours) for a specific date range.</span>
        </div>
        <hr className='query4Line' />
        {isFormVisible && (
          <>
            <form className='query4Form' onSubmit={handleSubmit}>
              <div className='query4Middle'>
              <div className='startDate'>
                  <label htmlFor="startDate">Start Date</label>
                  <input className='startDateInput' type="date" id="startDate" name="startDate" value={dates.startDate} onChange={handleChange} />
                </div>
                <div className='endDate'>
                  <label htmlFor="endDate">End Date</label>
                  <input className='endDateInput' type="date" id="endDate" name="endDate" value={dates.endDate} onChange={handleChange}/>
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
                      <h6 className='query4ResultsTitle'>Average Number of Crimes Per Hour:</h6>
                      <div className='Res4'>{results[0].avg_number_of_crimes_per_hour}</div>
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
