import './Query6.css'; 
import React, { useState } from "react";
import axios from 'axios';

export default function Query6() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const [params, setParams] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  const [category, setCategory] = useState("area_name"); // Default

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/db_manager/query6/', {
        params: {
          type: category, // Send the selected category as the type
          startDate: params.startDate,
          endDate: params.endDate,
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
      type: "",
      startDate: "",
      endDate: "",
    });
    setCategory("area_name"); // Reset the dropdown to its default value
    setResults([]);
    setIsFormVisible(false);
    setError(null);
  };


  return (
    <div className='query6'>
      <div className='query6Box'>
        <div className='query6Up' onClick={toggleFormVisibility} style={{ cursor: 'pointer' }}>
          <span className='query6Desc'>6. Find the top-5 Area names with regards to total number of crimes reported per day for a specific date range. The same for Rpt Dist No.</span>
        </div>
        <hr className='query6Line' />
        {isFormVisible && (
          <>
          <form className="query6Form" onSubmit={handleSubmit}>
            <div className="query6Middle">
              <div className="categorySelect">
                <label htmlFor="category">Select Input Type:</label>
                <select id="category" value={category} onChange={handleCategoryChange}>
                  <option value="area_name">Area Name</option>
                  <option value="rpt_dist_no">Rpt Dist No</option>
                </select>
              </div>

              <div className="DateBoxQuery6">
                <div className="startDate">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    className="startDateInput"
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={params.startDate}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="endDate">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    className="endDateInput"
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={params.endDate}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>

            {!results.length > 0 && (
              <div className="query6Down">
                <button type="submit" className="query6SubmitButton">
                  Submit
                </button>
              </div>
            )}
          </form>


            {error && <div className='query6Error'>{error}</div>}
            {results.length > 0 && (
              <div className="query6Results">
                <h4 className="query6ResultsTitle">Results:</h4>
                <div className="resultsTableWrapper">
                  <table className="resultsTable">
                    <thead>
                      <tr>
                        {category === "area_name" && <th>Area Name</th>}
                        {category === "rpt_dist_no" && <th>Rpt Dist No</th>}
                        <th>Total Crimes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          {category === "area_name" && <td>{result["area_name"]}</td>}
                          {category === "rpt_dist_no" && <td>{result["rpt_dist_no"]}</td>}
                          <td>{result["total_crimes"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <button onClick={handleReset} className="query6SubmitButton">Reset</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
