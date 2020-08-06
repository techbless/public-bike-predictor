/*global kakao*/

import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import DetailModal from './components/DetailModal';
import Header from './components/Header';
import './styles/App.css';
import styled from "styled-components";
import { Clickable } from 'react-clickable';

function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function App() {
  const [mapBound, setMapBound] = useState(null);
  const [map, setMap] = useState(null);
  const [mapClusterer, setMapClusterer] = useState(null);
  const [stations, setStations] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    kakao.maps.load(() => {
      let container = document.getElementById("Mymap");
      let options = {
        center: new kakao.maps.LatLng(37.5666805, 126.9784147),
        level: 5
      };

      const _map = new window.kakao.maps.Map(container, options);
      _map.setMaxLevel(6);
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: _map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
        gridSize: 150,
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
        minLevel: 6 // 클러스터 할 최소 지도 레벨 
      });
    
      setMap(_map);
      setMapBound(_map.getBounds())
      setMapClusterer(clusterer);

      function updateBound() {
        setTimeout(() => {
          setMapBound(_map.getBounds())
        }, 0)
      }

      kakao.maps.event.addListener(_map, 'idle', updateBound);
    });
    
    const APIURL = "http://49.50.166.60:5000/stations/available";
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
        
        const marker = new kakao.maps.Marker({
          title: station.stationName,
          position: markerPosition,
          image: markerImage
        });
        station.marker = marker;
        station.show = true;

        kakao.maps.event.addListener(marker, 'click', function() {
          setSelectedStation(station);
        });
        return station;
      });

      setStations(markersInfo);
    });
  }, []);

  useEffect(() => {
    if(!selectedStation) return;
    setShowDetail(true);
  }, [selectedStation]);

  useEffect(() => {
    if(!map) return;
    if(!mapBound) return;
    if(!mapClusterer) return;
    
    function filterStationsOnMap(stations) {
      const res = [];
      let idxForRes = 0;
      for(let i = 0; i < stations.length; i++) {
        if(stations[i].show === true && mapBound.contain(stations[i].marker.getPosition())) {
          res[idxForRes++] = stations[i].marker;
        }
      }
      return res;
    }

    setTimeout(() => {
      mapClusterer.clear();
      mapClusterer.addMarkers(filterStationsOnMap(stations));
    }, 0);

  }, [map, mapBound, mapClusterer, stations]);

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

  return (
    <div>
      <Header searchFn={search}/>
      <div className="App container-fluid">
        <DetailModal 
          show={showDetail} 
          station={selectedStation} 
          close={() => {
            setShowDetail(false);
            setSelectedStation(null);
          }
        }/>
        <div className="row">

          <div className="col-lg-9 App_map no-padding ">
            <MapContents id="Mymap"></MapContents>
          </div>

          <div className="col-lg-3 App_station_list d-none d-lg-block">
            <div className="container-fluid mt-3 ">
              {
                stations
                .filter(station => station.show === true)
                .map((station) => (
                    <Clickable onClick={() => {
                      map.setCenter(station.marker.getPosition());
                      map.setLevel(3, {
                        animate: {
                            duration: 500
                        }
                      });
                    }}>
                      <Card
                        name = {station.stationName}
                        id = {station.stationId}
                        stock = {station.parkingBikeTotCnt}
                        future = {station.future}
                      />
                    </Clickable>
                ))
              }
            </div>
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
