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
    
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    };

  const [code, setCode] = useState({
    crime_code: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCode((prevTimes) => ({
      ...prevTimes,
      [name]: value,
    }));
  };
  
  const [category, setCategory] = useState("area_name"); // Default
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query10/', {
        params: {
          type: category, // Send the selected category as the type
          crmCd: code.crime_code,
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
      crime_code: "",
    });
    setCategory("area_name"); // Reset the dropdown to its default value
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className="query10">
          <div className="query10Box">
        <div className='query10Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query10Desc'>10. Find the area with the longest time range without an occurrence of a specific crime. Include the time range in the results. The same for Rpt Dist No.</span>
        </div>
        <hr className='query10Line' />
     {isFormVisible && (
        <>
        <form className="query10Form" onSubmit={handleSubmit}>
            <div className='query10Middle'>
                <div className="query10Category">
                    <label htmlFor="category">Select Category</label>
                    <select id="category" value={category} onChange={handleCategoryChange}>
                        <option value="area_name">Area</option>
                        <option value="rpt_dist_no">Rpt Dist No</option>
                    </select>
                </div>

                <div className="query10CspecificCrime">
                    <label htmlFor="specificCrime">Specific Crime</label>
                    <select
                    className="crmCDquery10Input"
                    id="crmCDquery10Input"
                    name="crime_code"
                    placeholder="Select a Crime Code"
                    value={code.crime_code}
                    onFocus={() => handleFocus("crime_codes")}
                    onChange={handleChange}>
                    
                    <option value="" disabled>Select a Crime Code</option>
                    {options.crime_codes?.map((code, index) => (
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
                        {category === "area_name" && <th>Area Name</th>}
                        {category === "rpt_dist_no" && <th>Rpt Dist No</th>}
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          {category === "area_name" && <td>{result["area_name"]}</td>}
                          {category === "rpt_dist_no" && <td>{result["rpt_dist_no"]}</td>}
                          <td>{result["start_date"]}</td>
                          <td>{result["end_date"]}</td>
                          <td>{result["gap"]}</td>
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