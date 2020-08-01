import React, { useState, useEffect, Button } from 'react';
import './Card.css';
import DetailModel from './DetailModal';


function Card(props) {

    return (
        <div
            className="Card_card col-md-6 my-2 shadow-sm rounded"
        >
            <h4>{props.name}</h4>
            <hr />
            <h5>{props.id} - {props.stock}</h5>
        </div>
    );
    
  }
  
  export default Card;