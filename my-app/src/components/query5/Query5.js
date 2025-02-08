import './Query5.css';
import React, { useState } from "react";
import axios from "axios";

export default function Query4() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [params, setParameters] = useState({
      date: "",
      min_lat: "",
      max_lat: "",
      min_lon: "",
      max_lon: "",
  });


  const handleChange = (e) => {
      const { name, value } = e.target;
      setParameters((prevParams) => ({
          ...prevParams,
          [name]: value, // Updates the correct state key dynamically
      }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clearing previous errors.
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query5/', {
        params: {
            date: params.date,
            min_lat: params.min_lat,
            max_lat: params.max_lat,
            min_lon: params.min_lon,
            max_lon: params.max_lon,
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
        date: "",
        min_lat: "",
        max_lat: "",
        min_lon: "",
        max_lon: "",
    });
    
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };

  return (
    <div className='query5'>
      <div className='query5Box'>
        <div className='query5Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query5Desc'>5. Find the most common “Crm Cd” in a specified bounding box (as designated by GPS-coordinates) for a specific day.</span>
        </div>
        <hr className='query5Line' />
        {isFormVisible && (
          <>
            <form className='query5Form' onSubmit={handleSubmit}>
                <div className='query5Middle'>
                <div className='firstPart'>
                <div className='Date'>
                  <label htmlFor="Date">Date</label>
                  <input className='DateInput' type="date" id="Date" name="date" value={params.date} onChange={handleChange} />
                </div>
                </div>
                <div className='SecondPart'>            
                <div className='minLat'>
                  <label htmlFor="minLat">Min Latitude</label>
                  <input className='minLatInput' type="number" id="minLat" name="min_lat" value={params.min_lat} onChange={handleChange} />
                </div>
                <div className='maxLat'>
                  <label htmlFor="maxLat">Max Latitude</label>
                  <input className='maxLatInput' type="number" id="maxLat" name="max_lat" value={params.max_lat} onChange={handleChange} />
                </div>
         
                <div className='minLon'>
                  <label htmlFor="minLon">Min Longitude </label>
                  <input className='minLonInput' type="number" id="minLon" name="min_lon" value={params.min_lon} onChange={handleChange} />
                </div>
                <div className='maxLon'>
                  <label htmlFor="maxLon">Max Longitude </label>
                  <input className='maxLonInput' type="number" id="maxLon" name="max_lon" value={params.max_lon} onChange={handleChange} />
                </div>
                </div>
              </div>
              {!results.length > 0 &&(
              <div className='query5Down'>
                <button type="submit" className='query4SubmitButton'>Submit</button>
                </div>)}
              
              </form>
           
          {error && <div className='query5Error'>{error}</div>}
            {results.length > 0 && (
              <div className='query5Results'>
                <h4 className='query5ResultsTitle'>Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        <th>The most frequent crime</th>
                        <th>Crime Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{result["crime_code"]}</td>
                          <td>{result["crime_count"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {results.length > 0 && (
                <button onClick={handleReset} className="query5SubmitButton">Reset</button>
              )}
          </>
        )}
      </div>
    </div>
  );
}
