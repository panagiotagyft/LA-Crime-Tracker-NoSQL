import './Query11.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function Query11() {

  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };
  
  const [options, setOptions] = useState({
      crime_codes_desc: [],
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
      crime_code1: "",
      crime_code2: ""
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
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query11/', {
        params: {
          crmCd1: code.crime_code1,
          crmCd2: code.crime_code2,
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
        crime_code1: "",
        crime_code2: "",
    });
    
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className="query11">
          <div className="query11Box">
        <div className='query11Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query11Desc'>11.  For 2 crimes of your choice, find all areas that have received more than 1 report on each of these 2 crimes on the same day. The 2 crimes could be for example: “CHILD ANNOYING (17YRS & UNDER)” or “THEFT OF IDENTITY”. Do not restrict yourself to just these 2 specific types of crimes of course!</span>
        </div>
        <hr className='query11Line' />
     {isFormVisible && (
        <>
        <form className="query11Form" onSubmit={handleSubmit}>
            <div className='query11Middle'>
                <div className="query11CspecificCrime">
                    <label htmlFor="specificCrime">Specific Crime 1</label>
                    <select
                    className="crmCDquery11Input"
                    id="crmCDquery11Input"
                    name="crime_code1"
                    placeholder="Select a Crime Code"
                    value={code.crime_code1}
                    onFocus={() => handleFocus("crime_codes_desc")}
                    onChange={handleChange}>
                    
                    <option value="" disabled>Select a Crime Code</option>
                    {options.crime_codes_desc?.map((code, index) => (
                      <option key={index} value={code}>{code}</option>
                    ))}
                  </select>
                </div>

                <div className="query11CspecificCrime">
                    <label htmlFor="specificCrime">Specific Crime 2</label>
                    <select
                    className="crmCDquery11Input"
                    id="crmCDquery11Input"
                    name="crime_code2"
                    placeholder="Select a Crime Code"
                    value={code.crime_code2}
                    onFocus={() => handleFocus("crime_codes_desc")}
                    onChange={handleChange}>
                    
                    <option value="" disabled>Select a Crime Code</option>
                    {options.crime_codes_desc?.map((code, index) => (
                      <option key={index} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>
              
                {!results.length > 0 && (
                  <div className='query11Down'>
                    <button type="submit" className='query11SubmitButton'>Submit</button>
                  </div>
                )}
              </form>
      
            {error && <div className='query11Error'>{error}</div>}
            {results.length > 0 && (
              <div className="query11Results">
                <h4 className="query11ResultsTitle">Results:</h4>
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
                          <td>{result["Area"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <button onClick={handleReset} className="query11SubmitButton">Reset</button>
            )}     
        </>
        )}
      </div>
    </div>
  );
}