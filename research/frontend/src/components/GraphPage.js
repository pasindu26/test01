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

function GraphPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState('');
  const [chartData, setChartData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchGraphData = async () => {
    // Validate inputs
    if (!startDate || !endDate || !location) {
      setErrorMessage('Please provide start date, end date, and location.');
      return;
    }

    setErrorMessage('');
    try {
      const params = {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        location,
      };

      // Make GET request to backend
      const response = await axios.get('http://52.91.221.166:5000/graph-data', { params });

      const labels = response.data.map((entry) => entry.date);
      const data = response.data.map((entry) => entry.ph_value);

      // Update chart data
      setChartData({
        labels,
        datasets: [
          {
            label: `pH Values for Location: ${location}`,
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setErrorMessage('Failed to fetch graph data. Please try again later.');
    }
  };

  return (
    <div>
      <h2 className="mb-4">pH Value Graph</h2>
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={fetchGraphData}>
          Generate Graph
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

export default GraphPage;
