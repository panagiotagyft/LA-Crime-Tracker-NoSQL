import './Query13.css';
import React, { useState } from "react";
import axios from 'axios';

export default function Query13() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
    numberInput: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numberInput" && value && parseInt(value) <= 0) {
      alert("Please enter a positive integer greater than 0.");
      return; // αποτρέπει το update του state
    }
    setParams((prevTimes) => ({
      ...prevTimes,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query13/', {
        params: {
          startTime: params.startTime,
          endTime: params.endTime,
          N: params.numberInput
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

    setParams({
      startTime: "",
      endTime: "",
      numberInput: ""
    });
  
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query13'>

      <div className='query13Box'>
        
        <div className='query13Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query13Desc'>13. Find the total number of reports per day for a specific “N” and time range.</span>
        </div>

        <hr className='query13Line' />
        {isFormVisible && (
          <>
          <form className='query13Form' onSubmit={handleSubmit}>
            <div className='query13Middle'>
                <div className='startTime'>
                    <label htmlFor="startTime">Start Time</label>
                    <input className='startTimeInput' type="time" id="startTime" name="startTime" value={params.startTime} onChange={handleChange}/>
                </div>
                <div className='endTime'>
                    <label htmlFor="endTime">End Time</label>
                    <input className='endTimeInput' type="time" id="endTime" name="endTime" value={params.endTime} onChange={handleChange} />
                </div>
                
                  <div className='Nquery13'>
                      <label htmlFor="N">N</label>
                      <input
                        className="Nquery13Input"
                        id="N"
                        name="numberInput"
                        value={params.numberInput}
                        type="number"
                        placeholder="Enter a value > 0"
                        min="1"
                        onChange={handleChange}
                      />
                </div>
              </div>

              {results.length === 0 && (
                <div className='query13Down'>
                  <button type="submit" className='query13SubmitButton'>Submit</button>
                </div>
              )}

            </form>
         

            {error && <div className='query13Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query13Results'>
                <h4 className='query13ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>DR_NO</th>
                        <th>Area name</th>
                        <th>Crime code desc</th>
                        <th>Weapon desc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["DR_NO"]}</td>
                          <td>{result["Area name"]}</td>
                          <td>{result["Crime code desc"]}</td>
                          <td>{result["Weapon desc"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query13SubmitButton">Reset</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
