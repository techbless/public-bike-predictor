import React from 'react';
import '../styles/Card.css';

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
            <h6 className="text-center pt-2">{props.name}</h6>
            <hr className="my-2"/>
            <h6 className="text-center pb-2">현재: {props.stock}, 예측 평균: {Math.round(mean(props.future) * 1000) / 1000}</h6>
        </div>
    );

}
  
  export default Card;