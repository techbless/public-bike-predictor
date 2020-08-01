import React, { useState, useEffect } from 'react';
import Card from './Card';
import DetailModal from './DetailModal';
import './App.css';

function chunks(arr, size) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input should be Array');
  }

  if (typeof size !== 'number') {
    throw new TypeError('Size should be a Number');
  }

  let result = [];
  for(let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, size + i));
  }

  return result;
}

function App() {

  const [stations, setStations] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const APIURL = "http://openapi.seoul.go.kr:8088/664347526363796238356265787544/json/bikeList/1/1000"
      const resultInJson = await fetch(APIURL);
      const result = await resultInJson.json();

      if (result.rentBikeStatus.RESULT.CODE !== 'INFO-000') {
        return alert("에러가 발생했습니다.");
      }

      setStations(result.rentBikeStatus.row);

      setRows(chunks(result.rentBikeStatus.row, 2));
    }
    
    fetchData();
  }, []);

  return (
    <div className="App container-fluid">
      <DetailModal show={true}/>
      <div className="row">
        <div className="col-md-6 bg-success App_map">
          <h1>Map will be here.</h1>
        </div>
        <div className="col-md-6 App_station_list">
          <div class="container mt-5">
          {
            rows.map((row) => (
              <div className="row">
                {row.map((col) => (
                  <Card
                    name = {col.stationName}
                    id = {col.stationId}
                    stock = {col.parkingBikeTotCnt}
                  />
                ))}
              </div>
            ))
          }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
