import * as dotenv from 'dotenv';
dotenv.config();

import * as request from  'request';
import moment from 'moment-timezone';
import * as cron from 'node-cron';
import pool from './modules/db';
import { PoolConnection } from 'mysql2/promise';
import { BikeStationInfo, CurrentInfo } from './interfaces';

moment.tz.setDefault("Asia/Seoul");
const API_KEY = process.env.API_KEY;

function requestCurrentInfo(startIdx: number, endIdx: number) : Promise<string> {
    return new Promise((resolve, reject) => {
        request.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/${startIdx}/${endIdx}/`, (err: Error, res: request.Response) => {
            if(err) {
                reject(err);
            }

            resolve(res.body);
        })
    });
}

async function parseToBikeStatinInfo(currentInfoInJson: string) : Promise<BikeStationInfo[]> {
    try {
        // after JSON.parse, actually not typecasted correctly.
        const currentInfo: CurrentInfo = JSON.parse(currentInfoInJson).rentBikeStatus as CurrentInfo;
        const resultCode = currentInfo.RESULT.CODE;
        
        if(resultCode != 'INFO-000') {
            throw new Error("Result Code is not 'INFO-000'");
        }

        const bikeStations: BikeStationInfo[] = currentInfo.row.map((info) => {
            return {
                rackTotCnt: +info.rackTotCnt, // 거치소 개수
                stationName: info.stationName, // 대여소 이름
                parkingBikeTotCnt: +info.parkingBikeTotCnt, // 자전거 주차 총건수
                shared: +info.shared, // 거치율
                stationLatitude: +info.stationLatitude, // 위도
                stationLongitude: +info.stationLongitude, // 경도
                stationId: info.stationId // 대여소 ID
            }
        });

        return bikeStations;
    } catch(err) {
        throw new Error("Failed to parse API result(json).");
    }
}

async function removeDuplication(bikeStations: BikeStationInfo[]) {
    const filtered = bikeStations.filter((bikeStation, index) => {
        return index === bikeStations.findIndex((obj) => {
            return obj.stationId === bikeStation.stationId;
        })
    })

    return filtered;
}

async function loadAllCombinedInfo() {
    let bikeStations: BikeStationInfo[] = [];

    // 1 ~ 1000, 1001 ~ 2000, 2001 ~ 3000 나눠서 요청 보내야함.
    for(let i = 1; i <= 1001; i+=1000) {
        const startIdx = i;
        const endIdx = i + 999;

        const currentInfoInJson: string = await requestCurrentInfo(startIdx, endIdx);
        const newData: BikeStationInfo[] = await parseToBikeStatinInfo(currentInfoInJson);
        bikeStations = bikeStations.concat(newData);
    }

    return removeDuplication(bikeStations);
}

async function createTableIfNotExists(conn: PoolConnection, stationId: string) {
    const sql = "CREATE TABLE IF NOT EXISTS ?? (" + 
    " idx INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY," +
    " datetime VARCHAR(25) COLLATE 'utf8_bin'," +
    " stationName VARCHAR(200) COLLATE 'utf8_bin'," +
    " parkingBikeTotCnt INT(11)," +
    " stationLatitude INT(11)," +
    " stationLongitude INT(11)" +
    ") COLLATE='utf8_bin' ENGINE=InnoDB";

    const params = [stationId];
    await conn.query(sql, params);
}

async function saveBikeStationInfo(conn: PoolConnection, bikeStation: BikeStationInfo, datetime: string) {
    const sql = "INSERT INTO ?? (datetime, stationName, parkingBikeTotCnt, stationLatitude, stationLongitude) VALUES (?, ?, ?, ?, ?)";
    const params = [
        bikeStation.stationId, 
        datetime,
        bikeStation.stationName,
        bikeStation.parkingBikeTotCnt,
        bikeStation.stationLatitude,
        bikeStation.stationLongitude,
    ];

    await conn.query(sql, params);
}

async function doDBTaskFor(bikeStation: BikeStationInfo, datetime: string) {
    const conn = await pool.getConnection();

    // 새로운 대여소가 생길 것을 대비
    await createTableIfNotExists(conn, bikeStation.stationId);
    await saveBikeStationInfo(conn, bikeStation, datetime);
    conn.release();
}

async function startCollectingProcess() {
    let bikeStations: BikeStationInfo[] = await loadAllCombinedInfo();
    const now = moment().format('YYYY-MM-DD HH:mm');

    console.log(now, "Collecting Start : ", bikeStations.length);
    console.time("Load&Save");

    const tasks = bikeStations.map((bikeStation: BikeStationInfo) => {
        return doDBTaskFor(bikeStation, now);
    });
    await Promise.all(tasks);
    
    console.timeEnd("Load&Save");
}

function setScheduler(func: Function, min: number) {
    cron.schedule(`*/${min} * * * *`, async () => {
        try {
            await func();
        } catch(err) {
            console.log("Failed : ", err.message);
        }
    });
}

async function main() {
    console.log("Server Started!");
    const PERIOD_IN_MIN = 1;
    setScheduler(startCollectingProcess, PERIOD_IN_MIN);
}

main();