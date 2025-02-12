import './Query10.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function Query10() {

  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };
  
  const [options, setOptions] = useState({
      office_name: [],
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
    

  const [code, setCode] = useState({
    office_name: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCode((prevTimes) => ({
      ...prevTimes,
      [name]: value,
    }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query10/', {
        params: {
          officer_name: code.office_name, // Χρησιμοποιούμε το σωστό όνομα παραμέτρου
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
    setCode({
      office_name: "",
    });
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className="query10">
          <div className="query10Box">
        <div className='query10Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query10Desc'>10.  Find all areas for which a given name has casted a vote for a report involving it.</span>
        </div>
        <hr className='query10Line' />
     {isFormVisible && (
        <>
        <form className="query10Form" onSubmit={handleSubmit}>
            <div className='query10Middle'>

                <div className="query10CspecificCrime">
                    <label htmlFor="specificCrime">Specific Office Name</label>
                    <select
                    className="crmCDquery10Input"
                    id="crmCDquery10Input"
                    name="office_name"
                    placeholder="Select a Office Name"
                    value={code.office_name}
                    onFocus={() => handleFocus("office_name")}
                    onChange={handleChange}>
                    
                    <option value="" disabled>Select a Office Name</option>
                    {options.office_name?.map((code, index) => (
                      <option key={index} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>
              
                {!results.length > 0 && (
                  <div className='query10Down'>
                    <button type="submit" className='query10SubmitButton'>Submit</button>
                  </div>
                )}
              </form>
      
            {error && <div className='query10Error'>{error}</div>}
            {results.length > 0 && (
              <div className="query10Results">
                <h4 className="query10ResultsTitle">Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          {/* <td>{Array.isArray(result._id) ? result._id.join(", ") : result._id}</td> Handle both cases */}
                          <td>{result._id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <button onClick={handleReset} className="query10SubmitButton">Reset</button>
            )}     
        </>
        )}
      </div>
    </div>
  );
}