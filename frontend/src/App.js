import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import Card from './components/Card';
import Map from './components/Map';
import DetailModal from './components/DetailModal';
import './styles/App.css';

function App() {
  const [stations, setStations] = useState([]);
  const [showingStations, setShowingStations] = useState([]);
  const [searchWord, setSearchWord] = useState('');
  const [searching, setSearching] = useState(false);

  // search stations
  useEffect(() => {
    setSearching(searchWord !== '');

    if(!searching) {
      setShowingStations(stations);
      return;
    }

    setShowingStations(
      stations.filter((station) => {
        return station.stationName.includes(searchWord);
      }
    ));
  }, [searchWord, searching, stations]);

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
          <Map stations={showingStations} />
        </div>

        <div className="col-md-3 App_station_list d-none d-md-block">
          <div className="container-fluid">
            <InputGroup className="mt-3">
              <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">검색</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                onChange={e => setSearchWord(e.target.value)}
              />
            </InputGroup>
          </div>
          

          <div className="container-fluid mt-3 ">
            {
              showingStations.map((station) => (
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
