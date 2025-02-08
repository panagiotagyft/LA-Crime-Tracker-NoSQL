
import './Query8.css';
import React, { useState } from "react";
import axios from "axios";


export default function Query8() {
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const [parameters, setParameters] = useState({
    startDate: "",
    endDate: "",
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
    setParameters((prevDates) => ({
      ...prevDates,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clearing previous errors.

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query8/', {
        params: {
          startDate: parameters.startDate,
          endDate: parameters.endDate,
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
      startDate: "",
      endDate: "",
      crmCd: "",
    });
  
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query8'>

      <div className='query8Box'>
        
        <div className='query8Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query8Desc'>8. Find the second most common crime that has co-occurred with a particular crime for a specific date range.</span>
        </div>

        <hr className='query8Line' />
        {isFormVisible && (
          <>
          <form className='query8Form' onSubmit={handleSubmit}>
              <div className='query8Middle'>
              <div className='startDate'>
                <label htmlFor="startDate">Start Date</label>
                <input
                  className='startDateInput'
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={parameters.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className='endDate'>
                <label htmlFor="endDate">End Date</label>
                <input className='endDateInput'
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={parameters.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className='crmCDquery8'>
                <label htmlFor="crmCD">Crime Code</label>
                <select
                  className="crmCDquery8Input"
                  id="crmCDquery8Input"
                  name="crmCd"
                  placeholder="Select a Crime Code"
                  value={parameters.crmCd}
                  onFocus={() => handleFocus("crime_codes")}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select a Crime Code</option>
                  {options.crime_codes?.map((code, index) => (
                    <option key={index} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              </div>

              {!results.length > 0 &&(
                <div className='query8Down'>
                <button type="submit" className='query8SubmitButton'>Submit</button>
                </div>)}
              
          </form>
            
           {error && <div className='query8Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query8Results'>
                <h4 className='query8ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper2">
                  <table className="resultsTable2">
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
              <button onClick={handleReset} className="query8SubmitButton">Reset</button>
            )}
          </>
        )}

      </div>

    </div>
  )
}
