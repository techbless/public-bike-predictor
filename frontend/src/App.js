import React, { useState, useEffect } from 'react';
import Card from './Card';
import DetailModal from './DetailModal';
import './App.css';

function App() {

  const [stations, setStations] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const APIURL = "http://49.50.166.60:5000/stations/available"
      const resultInJson = await fetch(APIURL);
      const result = await resultInJson.json();

      setStations(result);
      // setRows(chunks(result, 2));
    }
    
    fetchData();
  }, []);

  return (
    <div className="App container-fluid">
      <DetailModal show={true}/>
      <div className="row">

        <div className="col-md-9 bg-success App_map">
          <h1>Map will be here.</h1>
        </div>

        <div className="col-md-3 App_station_list">
          <div className="container mt-5">
            {
              stations.map((station) => (
                  <Card
                    name = {station.stationName}
                    id = {station.stationId}
                    stock = {station.parkingBikeTotCnt}
                    future = {station.future}
                  />
              ))
            }
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default App;
