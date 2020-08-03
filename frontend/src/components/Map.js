/*global kakao*/
import React, { useEffect } from 'react';
import styled from "styled-components";

function Map(props) {

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=	15ba3f117f826b992d061daf8e7f7578&autoload=false";
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        let container = document.getElementById("Mymap");
        let options = {
          center: new kakao.maps.LatLng(37.506502, 127.053617),
          level: 7
        };

        const map = new window.kakao.maps.Map(container, options);
     
      });
    }
  }, []);

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