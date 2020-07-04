import * as request from  'request';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

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

function requestCurrentInfo(startIdx: number, endIdx: number) {
    return new Promise((resolve, reject) => {
        request.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/${startIdx}/${endIdx}/`, (err: Error, res: request.Response) => {
            if(err) {
                throw new Error("Failed to get stations info.")
            }
            resolve(res.body);
        })
    });
}

async function parseToBikeStatinInfo(currentInfoInJson: string) : Promise<BikeStationInfo[]> {
    const currentInfo: CurrentInfo = JSON.parse(currentInfoInJson).rentBikeStatus;
    const resultCode = currentInfo.RESULT.CODE;
    const nInfo = currentInfo.list_total_count;
    const bikeStations: BikeStationInfo[] = currentInfo.row;

    if(resultCode != 'INFO-000' && nInfo >= 1) {
        throw new Error("Failed to parse json.");
    }

    return bikeStations;
}

async function loadAllCombinedInfoTo(bikeStations: BikeStationInfo[]) {
    for(let i = 1; i <= 2001; i+=1000) {
        const startIdx = i;
        const endIdx = i + 999;

        const currentInfoInJson: string = await requestCurrentInfo(startIdx, endIdx) as string;
        const temp: BikeStationInfo[] = await parseToBikeStatinInfo(currentInfoInJson);

        temp.map((station: BikeStationInfo) => {
            bikeStations.push(station);
        });
    }
}

async function main() {
    
    // 1 ~ 1000, 1001 ~ 2000, 2001 ~ 3000 나눠서 요청 보내야함.
    let bikeStations: BikeStationInfo[] = [];
    await loadAllCombinedInfoTo(bikeStations);
    
    console.log(bikeStations.length);

}

main();