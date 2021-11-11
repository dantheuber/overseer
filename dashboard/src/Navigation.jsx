import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { NewSiteButton } from './sites/NewSiteButton';
import { LoginButton } from './user/LoginButton';

export const NavBar = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Overseer</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={NewSiteButton} />
        </Nav>
      </Navbar.Collapse>
      <Nav className="mr-auto">
        <Nav.Link as={LoginButton}/>
      </Nav>
    </Navbar>
  );
};