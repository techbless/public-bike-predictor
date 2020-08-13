# public-bike-predictor

**서울시 공공자전거 따릉이의 미래 재고수를 예측합니다.**   
**Forecast stock of public bicycles in Seoul.**

## 디렉터리별 설명
Directory-specific usage description 

|      디렉터리      |         용도         |
|:-----------------:|:--------------------:|
| dataset-collector | 데이터 수집기         |
| predictor         | 재고 예측 모델 및 백엔드 서버 |
| frontend          | 프론트엔드 서버          |


## 환경변수
각 서버에서 아래에 명시된 환경변수를 가져야 합니다.

### 데이터 수집기 & 재고 예측 모델 및 백엔드 서버

|    환경변수     | 환경변수 값 |
|----------------|------------|
| MYSQL_DATABASE | MYSQL DB명 |
| MYSQL_HOST     | MYSQL HOST 주소 |
| MYSQL_USER     | MYSQL 유저명 |
| MYSQL_PASSWORD | MYSQL 비밀번호 |
| API_KEY        | 따릉이 공공 API 인증키 |

## 실행 방법
### 데이터 수집기
``` console
cd ./dataset-collector
npm install
npm build
npm start
```

### 프론트엔드
``` console
cd ./frontend
npm install
npm build
serve ./build -p 80
```
