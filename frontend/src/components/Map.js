/*global kakao*/
import React, { useEffect } from 'react';
import styled from "styled-components";

function Map(props) {

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=	15ba3f117f826b992d061daf8e7f7578&autoload=false&libraries=services,clusterer,drawing";
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        let container = document.getElementById("Mymap");
        let options = {
          center: new kakao.maps.LatLng(37.506502, 127.053617),
          level: 7
        };

        const map = new window.kakao.maps.Map(container, options);
        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
          averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
          minLevel: 5 // 클러스터 할 최소 지도 레벨 
        });

        const markers = props.stations.map((station) => {
          const markerPosition  = new kakao.maps.LatLng(+station.stationLatitude, +station.stationLongitude); 
          const marker = new kakao.maps.Marker({
            //map: map,
            title: station.stationName,
            position: markerPosition
          });

          return marker;
        });

        clusterer.addMarkers(markers);
      });
    }
  }, [props.stations]);

    return (
      <MapContents id="Mymap"></MapContents>
    );
    
  }

const MapContents = styled.div`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;
  
  export default Map;