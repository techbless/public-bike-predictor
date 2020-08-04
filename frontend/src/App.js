/*global kakao*/

import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import Card from './components/Card';
import DetailModal from './components/DetailModal';
import './styles/App.css';
import styled from "styled-components";


function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function App() {
  const [mapClusterer, setMapClusterer] = useState(null);
  const [stations, setStations] = useState([]);

  //const [searchWord, setSearchWord] = useState('');

  async function search(e) {
    const searchWord = e.target.value;
    if(searchWord === '') {
      setStations(stations.map(station => {
        station.show = true
        return station;
      }));
    } 
    else {
      setStations(
        stations.map((station) => {
          station.show = station.stationName.includes(searchWord) ? true : false;
          return station;
        })
      );
    }
  }

  useEffect(() => {
    if(!mapClusterer) return;

    async function updateMap() {
      mapClusterer.clear();
      mapClusterer.addMarkers(
        stations
          .filter(station => station.show === true)
          .map(station => station.marker)
      );
    }

    updateMap();
  }, [mapClusterer, stations]);

  useEffect(() => {
    kakao.maps.load(() => {
      let container = document.getElementById("Mymap");
      let options = {
        center: new kakao.maps.LatLng(37.506502, 127.053617),
        level: 5
      };

      const map = new window.kakao.maps.Map(container, options);
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
        minLevel: 5 // 클러스터 할 최소 지도 레벨 
      });

      setMapClusterer(clusterer);
    });

    const APIURL = "http://49.50.166.60:5000/stations/available"
    fetch(APIURL)
    .then((res) => res.json())
    .then(res => {
      const markersInfo = res.map((station) => {
        const markerPosition  = new kakao.maps.LatLng(+station.stationLatitude, +station.stationLongitude); 
        
        const UP_IMG = 'https://cdn.mapmarker.io/api/v1/pin?size=110&background=%230C797D&icon=fa-arrow-up&color=%23FFFFFF&voffset=0&hoffset=0&';
        const DOWN_IMG = 'https://cdn.mapmarker.io/api/v1/pin?size=110&background=%23F44E3B&icon=fa-arrow-down&color=%23FFFFFF&voffset=0&hoffset=0&';
        
        let markerImageSrc;
        if (mean(station.future) >= station.parkingBikeTotCnt) {
          markerImageSrc = UP_IMG;
        }
        else {
          markerImageSrc = DOWN_IMG;
        }
  
        const markerImage = new window.kakao.maps.MarkerImage(
          markerImageSrc,
          new kakao.maps.Size(40, 40),
          {offeset: new kakao.maps.Point(0, 0)}
        )
        //console.log(markerImage)
        const marker = new kakao.maps.Marker({
          title: station.stationName,
          position: markerPosition,
          image: markerImage
        });
  
        station.marker = marker;
        station.show = true;
        return station;
      });

      setStations(markersInfo);
    });
  }, []);

  return (
    <div className="App container-fluid">
      <DetailModal show={false}/>
      <div className="row">

        <div className="col-md-9 App_map no-padding ">
          <MapContents id="Mymap"></MapContents>
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
                onChange={search}
              />
            </InputGroup>
          </div>
          

          <div className="container-fluid mt-3 ">
            {
              stations
              .filter(station => station.show === true)
              .map((station) => (
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

const MapContents = styled.div`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;

export default App;
