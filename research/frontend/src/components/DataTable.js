// src/components/DataTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

function DataTable() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false); // State to track polling status

  // Fetch data from the backend
  const fetchData = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://52.91.221.166:5000/data', {
        params: params,
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPolling) {
      const interval = setInterval(() => {
        const params = {};
        if (date) {
          params.date = moment(date).format('YYYY-MM-DD'); // Format date properly
        }
        if (location) {
          params.location = location;
        }
        fetchData(params);
      }, 5000); // Fetch data every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount or when polling stops
    }
  }, [isPolling, date, location]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (date) {
      params.date = moment(date).format('YYYY-MM-DD'); // Send date in proper format
    }
    if (location) {
      params.location = location;
    }
    fetchData(params);
  };

  const handleReset = () => {
    setDate(null);
    setLocation('');
    fetchData();
  };

  const togglePolling = () => {
    setIsPolling((prev) => !prev); // Toggle polling state
  };

  return (
    <div>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col xs={12} md={4}>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <InputGroup>
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  placeholderText="Select date"
                />
                <Button variant="outline-secondary" onClick={() => setDate(null)}>
                  Clear
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="d-flex align-items-end">
            <div className="w-100">
              <Button variant="primary" type="submit" className="mr-2 mb-2 w-100">
                Search
              </Button>
              <Button variant="secondary" onClick={handleReset} className="w-100">
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      <div className="mb-3">
        <Button
          variant={isPolling ? 'danger' : 'success'}
          onClick={togglePolling}
        >
          {isPolling ? 'Stop Refreshing Data' : 'Start Refreshing Data'}
        </Button>
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="thead-dark">
              <tr>
                <th>ID</th>
                <th>pH Value</th>
                <th>Temperature</th>
                <th>Location</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.ph_value}</td>
                    <td>{item.temperature}</td>
                    <td>{item.location}</td>
                    <td>{moment(item.time, 'HH:mm').format('hh:mm A')}</td>
                    <td>{moment(item.date, 'YYYY-MM-DD').format('MMMM Do, YYYY')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default DataTable;
