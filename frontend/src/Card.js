import React, { useState, useEffect, Button } from 'react';
import './Card.css';

function mean(arr) {
    return arr.reduce((a, b) => a + b) / arr.length;
}

function Card(props) {

    return (
        <div
            className={
                mean(props.future) >= props.stock ? 
                "up Card_card my-2 shadow-sm rounded" : 
                "down Card_card my-2 shadow-sm rounded"
            }
        >
            <h4>{props.name}</h4>
            <hr />
            <h5>현재: {props.stock}, 예측: {mean(props.future)}</h5>
        </div>
    );
    
  }
  
  export default Card;