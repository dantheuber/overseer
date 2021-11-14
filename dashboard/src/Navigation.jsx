import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { NewSiteButton } from './sites/NewSiteButton';
import { LoginButton } from './user/LoginButton';
import { LogoutButton } from './user/LogoutButton';
import { useUser } from './user/UserContext';

export const NavBar = () => {
  const { isLoggedIn } = useUser();
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Overseer</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          { isLoggedIn && <Nav.Link as={NewSiteButton} /> }
        </Nav>
      </Navbar.Collapse>
      <Nav className="mr-auto">
        { !isLoggedIn && <Nav.Link as={LoginButton} /> }
        { isLoggedIn && <Nav.Link as={LogoutButton} /> }
      </Nav>
    </Navbar>
  );
};