export interface BikeStationInfo {
  rackTotCnt: number, // 거치소 개수
  stationName: string, // 대여소 이름
  parkingBikeTotCnt: number, // 자전거 주차 총건수
  shared: number, // 거치율
  stationLatitude: number, // 위도
  stationLongitude: number, // 경도
  stationId: string // 대여소 ID
}