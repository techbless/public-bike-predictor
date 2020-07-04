import * as request from  'request';
import * as dotenv from 'dotenv';

dotenv.config();

interface BikeStationInfo {
    rackTotCnt: number, // 거치소 개수
    stationName: string, // 대여소 이름
    parkingBikeTotCnt: number, // 자전거 주차 총건수
    shared: number, // 거치율
    stationLatitude: number, // 위도
    stationLongitude: number, // 경도
    stationId: number // 대여소 ID
}

interface CurrentInfo {
    list_total_count: number;
    RESULT: {
        CODE: string;
        MESSAGE: string;
    };
    row: BikeStationInfo[];
}

const API_KEY = process.env.API_KEY;
function requestCurrentInfo(startIdx: number, endIdx: number) {
    return new Promise((resolve, reject) => {
        request.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/${startIdx}/${endIdx}/`, (err: Error, res: request.Response) => {
            resolve(res.body);
        })
    });
}

async function main() {
    const currentInfoInJson: string = await requestCurrentInfo(1, 10) as string;
    const currentInfo: CurrentInfo = JSON.parse(currentInfoInJson).rentBikeStatus;
    const resultCode = currentInfo.RESULT.CODE;
    const nInfo = currentInfo.list_total_count;
    const bikeStations: BikeStationInfo[] = currentInfo.row;

    if(resultCode != 'INFO-000') {
        console.log(resultCode, nInfo);
    }

    console.log(bikeStations);
}

main();