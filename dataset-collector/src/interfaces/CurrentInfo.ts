import { BikeStationInfo } from './BikeStationInfo';

export interface CurrentInfo {
  list_total_count: number;
  RESULT: {
      CODE: string;
      MESSAGE: string;
  };
  row: BikeStationInfo[];
}