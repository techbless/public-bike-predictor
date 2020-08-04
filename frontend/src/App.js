import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import Map from './components/Map';
import DetailModal from './components/DetailModal';
import './styles/App.css';

function App() {

  const [stations, setStations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const APIURL = "http://49.50.166.60:5000/stations/available"
      const resultInJson = await fetch(APIURL);
      const result = await resultInJson.json();

      setStations(result);
    }
    
    fetchData();
  }, []);

  return (
    <div className="App container-fluid">
      <DetailModal show={false}/>
      <div className="row">

        <div className="col-md-9 App_map no-padding ">
          <Map stations={stations} />
        </div>

        <div className="col-md-3 App_station_list d-none d-md-block">
          <div className="container-fluid mt-2 ">
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
