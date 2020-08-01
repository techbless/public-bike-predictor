import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav, Navbar } from 'react-bootstrap';

ReactDOM.render(
  <React.StrictMode>
      <Navbar bg="dark" expand="lg" variant = "dark">
       <Navbar.Brand href="#home" >따르릉</Navbar.Brand>
       <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#list" >리스트로 보기</Nav.Link>
          <Nav.Link href="#map">지도로 보기</Nav.Link>
        </Nav>
        </Navbar.Collapse>
      </Navbar>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
