/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {Line} from 'react-chartjs-2';

import '../styles/DetailModal.css';

function DetailModal({show, close, station}){

  const [data, setData] = useState(null);



  useEffect(() => {
    if(!station) return;

    const APIURL = `http://49.50.166.60:5000/station/${station.stationId}/history`;
    fetch(APIURL)
    .then((res) => res.json())
    .then(history => {
      const historyData = history.map(t => {
        return {
          //x: t.datetime.substring(5),
          x: t.datetime,
          y: t.parkingBikeTotCnt
        }
      });

      const lastDate = new Date(history[history.length - 1].datetime);
      console.log("last", lastDate);
      let futureTime = [5, 10, 15, 20, 25, 30];
      futureTime = futureTime.map(f => {
        // const d = new Date();
        // d.setMinutes(lastDate.getMinutes() + f);
        // return d;
        return new Date(lastDate.getTime() + f*60000);
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
            fill: false,
            data: historyData
          },
          {
            label: '예측',
            fill: false,
            borderColor: "#80b6f4",
            pointBorderColor: "#80b6f4",
            pointBackgroundColor: "#80b6f4",
            pointHoverBackgroundColor: "#80b6f4",
            pointHoverBorderColor: "#80b6f4",
            data: futureData
          }
        ]
      }

      setData(_data);
    });
  }, [station]);

  const options = {
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
        scaleLabel: {
          display: true,
          labelString: 'value'
        },
        ticks: {
          min: 0, // minimum value
          max: 50 // maximum value
      }
      }]
    }
  }

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
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button variant="primary" onClick={close}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DetailModal;