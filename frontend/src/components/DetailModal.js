/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {Line} from 'react-chartjs-2';

import moment from 'moment';

import '../styles/DetailModal.css';

function max(previous, current) { 
  return previous > current ? previous:current;
}

function DetailModal({show, close, station}){

  const [data, setData] = useState(null);
  const [options, setOptions] = useState(null);

  useEffect(() => {
    if(!station) return;

    const APIURL = `http://49.50.166.60:5000/station/${station.stationId}/history`;
    fetch(APIURL)
    .then((res) => res.json())
    .then(history => {
      const historyData = history.map(t => {
        return {
          x: moment(t.datetime, "YYYY-MM-DD hh:mm"),
          y: t.parkingBikeTotCnt
        }
      });

      const lastDate = history[history.length - 1].datetime;
      console.log("last", lastDate);
      let futureTime = [5, 10, 15, 20, 25, 30];
      futureTime = futureTime.map(f => {
        return moment(lastDate, "YYYY-MM-DD hh:mm").add(f, 'minutes');
      })
      console.log(futureTime);
      const futureData = []
      for(let i = 0; i < 6; i++) {
        futureData.push({
          x: futureTime[i],
          y: station.future[i]
        });
      }
      
      console.log(futureData);
      const _data = {
        datasets: [
          {
            label: '따릉이',
            data: historyData,
            fill: true,
            borderColor: "#8fa194",
            backgroundColor: "rgb(143, 161, 148, .2)",
            pointBorderColor: "#999999",
            pointBackgroundColor: "#8fa194",
            pointHoverBackgroundColor: "#80b6f4",
            pointHoverBorderColor: "#80b6f4"
          },
          {
            label: '예측',
            data: futureData,
            fill: true,
            borderColor: "#3ccfb6",
            backgroundColor: "rgb(60, 207, 182, .2)",
            pointBorderColor: "#3ccfb6",
            pointBackgroundColor: "#3ccfb6",
            pointHoverBackgroundColor: "#3ccfb6",
            pointHoverBorderColor: "#3ccfb6",
          }
        ]
      }

      const historyMax = historyData.map(h => h.y).reduce(max);
      const futureMax = futureData.map(f => f.y).reduce(max);
      const maxValue = futureMax > historyMax ? futureMax : historyMax;

      const _options = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            sclaeLabel: {
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              min: 0,
              max: maxValue + 5
            }
          }]
        }
      };

      setData(_data);
      setOptions(_options);
    });
  }, [station]);

  

  return(
    <Modal size="lg" show={show} onHide={close} id="modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>{station ? station.stationName : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mx-auto canvas-container">
        {
          
          data && <Line data={data} options={options} />

        }
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={close}>
          Close
        </Button> */}
        <Button variant="danger" onClick={close}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DetailModal;