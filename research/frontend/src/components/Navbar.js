import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import '../my.css' // Import the CSS file for custom styles

function AppNavbar() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="navbar-custom">
      <Navbar.Brand href="#" className="brand-custom">
        Sensor Data Dashboard
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="brand-custom">
        <Nav className="ml-auto">
          <Nav.Link as={NavLink} to="/" end>
            Home
          </Nav.Link>
          <Nav.Link as={NavLink} to="/graphs">
            Graphs
          </Nav.Link>
          <Nav.Link as={NavLink} to="/compare-graphs">
            compare-graphs
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar;
