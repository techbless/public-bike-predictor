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
            <h5 className="text-center">{props.name}</h5>
            <hr className="my-2"/>
            <h6 className="text-center">현재: {props.stock}, 예측 평균: {Math.round(mean(props.future) * 1000) / 1000}</h6>
        </div>
    );
    
  }
  
  export default Card;