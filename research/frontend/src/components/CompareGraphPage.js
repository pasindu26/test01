import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

function CompareGraphPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const removeLocation = (location) => {
    setLocations(locations.filter((loc) => loc !== location));
  };

  const fetchGraphData = async () => {
    if (!startDate || !endDate || locations.length === 0) {
      setErrorMessage('Please provide start date, end date, and at least one location.');
      return;
    }
  
    setErrorMessage('');
    try {
      const params = {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        locations: locations.join(','), // Send as a comma-separated string
      };
  
      const response = await axios.get('http://52.91.221.166:5000/compare-graph-data', { params });
  
      const datasets = Object.keys(response.data).map((location, index) => ({
        label: `pH Values for Location: ${location}`,
        data: response.data[location].map((entry) => entry.ph_value),
        borderColor: `hsl(${index * 60}, 70%, 50%)`, // Generate unique colors
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
        tension: 0.3,
        fill: false,
      }));
  
      const labels = [...new Set(response.data[Object.keys(response.data)[0]].map((entry) => entry.date))];
  
      setChartData({
        labels,
        datasets,
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setErrorMessage('Failed to fetch graph data. Please try again later.');
    }
  };
  

  return (
    <div>
      <h2 className="mb-4">Compare pH Values Across Locations</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Form className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            placeholderText="Select start date"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            placeholderText="Select end date"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
          <Button variant="secondary" onClick={addLocation} className="mt-2">
            Add Location
          </Button>
        </Form.Group>
        <div className="mb-3">
          {locations.map((loc, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <span className="me-2">{loc}</span>
              <Button variant="danger" size="sm" onClick={() => removeLocation(loc)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={fetchGraphData}>
          Generate Comparison Graph
        </Button>
      </Form>
      {chartData && (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: { mode: 'index', intersect: false },
            },
            scales: {
              x: { title: { display: true, text: 'Date' } },
              y: { title: { display: true, text: 'pH Value' } },
            },
          }}
        />
      )}
    </div>
  );
}

export default CompareGraphPage;
