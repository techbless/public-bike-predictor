import React from 'react';
import { Navbar, InputGroup, FormControl } from 'react-bootstrap';
import '../styles/Header.css';

function Header(props) {
    return (
      <Navbar bg="dark" expand="lg" variant = "dark" className="justify-content-between">
        <Navbar.Brand href="#home" >따르릉</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="flex-grow-0 search-input">
          <hr />
          <InputGroup className="w-100 mb-2">
            <InputGroup.Prepend>
              <InputGroup.Text id="inputGroup-sizing-default">검색</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              aria-label="Default"
              aria-describedby="inputGroup-sizing-default"
              onChange={props.searchFn}
            />
          </InputGroup>
        </Navbar.Collapse>
     </Navbar>
    );
    
  }
  
  export default Header;