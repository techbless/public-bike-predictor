import * as dotenv from 'dotenv';
dotenv.config();

import * as request from  'request';

import moment from 'moment-timezone';

import * as cron from 'node-cron';
import pool from './modules/db';
import { PoolConnection } from 'mysql2/promise';

moment.tz.setDefault("Asia/Seoul");
const API_KEY = process.env.API_KEY;

interface BikeStationInfo {
    rackTotCnt: number, // 거치소 개수
    stationName: string, // 대여소 이름
    parkingBikeTotCnt: number, // 자전거 주차 총건수
    shared: number, // 거치율
    stationLatitude: number, // 위도
    stationLongitude: number, // 경도
    stationId: string // 대여소 ID
}

interface CurrentInfo {
    list_total_count: number;
    RESULT: {
        CODE: string;
        MESSAGE: string;
    };
    row: BikeStationInfo[];
}

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
    // after JSON.parse, actually not typecasted correctly.
    const currentInfo: CurrentInfo = JSON.parse(currentInfoInJson).rentBikeStatus as CurrentInfo;

    const resultCode = currentInfo.RESULT.CODE;

    let bikeStations: BikeStationInfo[] = currentInfo.row.map((info) => {
        return {
            rackTotCnt: +info.rackTotCnt, // 거치소 개수
            stationName: info.stationName, // 대여소 이름
            parkingBikeTotCnt: +info.parkingBikeTotCnt, // 자전거 주차 총건수
            shared: +info.shared, // 거치율
            stationLatitude: +info.stationLatitude, // 위도
            stationLongitude: +info.stationLongitude, // 경도
            stationId: info.stationId // 대여소 ID
        }
    })

    if(resultCode != 'INFO-000') {
        throw new Error("Failed to parse json.");
    }

    return bikeStations;
}

async function loadAllCombinedInfoTo(bikeStations: BikeStationInfo[]) {
    // 1 ~ 1000, 1001 ~ 2000, 2001 ~ 3000 나눠서 요청 보내야함.
    for(let i = 1; i <= 2001; i+=1000) {
        const startIdx = i;
        const endIdx = i + 999;

        const currentInfoInJson: string = await requestCurrentInfo(startIdx, endIdx);
        const temp: BikeStationInfo[] = await parseToBikeStatinInfo(currentInfoInJson);

        temp.map((station: BikeStationInfo) => {
            bikeStations.push(station);
        });
    }
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

let count = 0;
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
    count++;
}

async function startCollectingProcess() {
    
    let bikeStations: BikeStationInfo[] = [];
    await loadAllCombinedInfoTo(bikeStations);

    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(now)

    for await (let bikeStation of bikeStations) {
        const conn = await pool.getConnection();
        // 새로운 대여소가 생길 것을 대비
        await createTableIfNotExists(conn, bikeStation.stationId);
        await saveBikeStationInfo(conn, bikeStation, now);
        conn.release();
    }
    console.log(bikeStations.length == count);
    console.log('done');
}

function setScheduler(func: Function, min: number) {
    cron.schedule(`*/${min} * * * *`, () => {
        func();
    });
}

async function main() {
    const PERIOD_IN_MIN = 5;
    setScheduler(startCollectingProcess, PERIOD_IN_MIN);
}

main();