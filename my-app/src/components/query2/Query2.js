import './Query2.css';
import React, { useState } from "react";
import axios from "axios";


export default function Query2() {
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const [parameters, setParameters] = useState({
    startTime: "",
    endTime: "",
    crmCd: "",
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [options, setOptions] = useState({
      crime_codes: [],
  });
  
  const fetchOptions = (type) => {
    axios.get("http://127.0.0.1:8000/api/db_manager/dropdown-options/", {
        params: { type },
    })
    .then((response) => {
        const newOptions = response.data[type] || [];
        setOptions((prev) => ({
            ...prev,
            [type]: newOptions,
        }));
    })
    .catch((error) => console.error(`Error fetching ${type} options:`, error));
  };

  const handleFocus = (type) => {
      if (options[type].length === 0) {
          fetchOptions(type, true);
      }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setParameters((prevTimes) => ({
      ...prevTimes,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clearing previous errors.

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query2/', {
        params: {
          startTime: parameters.startTime,
          endTime: parameters.endTime,
          crmCd: parameters.crmCd
        },
      });

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
  
    setParameters({
      startTime: "",
      endTime: "",
      crmCd: "",
    });
  
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query2'>

      <div className='query2Box'>
        
        <div className='query2Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query2Desc'>2. Find the total number of reports per day for a specific “Crm Cd” and time range.</span>
        </div>

        <hr className='query2Line' />
        {isFormVisible && (
          <>
          <form className='query2Form' onSubmit={handleSubmit}>
              <div className='query2Middle'>
              <div className='startTime2'>
                <label htmlFor="startTime2">Start Time</label>
                <input
                  className='startTimeInput2'
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={parameters.startTime}
                  onChange={handleChange}
                />
              </div>
              <div className='endTime2'>
                <label htmlFor="endTime2">End Time</label>
                <input className='endTimeInput2'
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={parameters.endTime}
                  onChange={handleChange}
                />
              </div>
              <div className='crmCDquery2'>
                <label htmlFor="crmCD">Crime Code</label>
                <select
                  className="crmCDquery2Input"
                  id="crmCDquery2Input"
                  name="crmCd"
                  placeholder="Select a Crm Cd"
                  value={parameters.crmCd}
                  onFocus={() => handleFocus("crime_codes")}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select a Crm Cd</option>
                  {options.crime_codes?.map((code, index) => (
                    <option key={index} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              </div>

              {!results.length > 0 &&(
                <div className='query2Down'>
                <button type="submit" className='query2SubmitButton'>Submit</button>
                </div>)}
              
          </form>
            
           {error && <div className='query2Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query2Results'>
                <h4 className='query2ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Report Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["Reported Day"]}</td>
                          <td>{result["Total number of reports"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <button onClick={handleReset} className="query2SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}