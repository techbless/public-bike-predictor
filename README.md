# public-bike-predictor

**서울시 공공자전거 따릉이의 미래 재고수를 예측합니다.**   
**Forecast stock of public bicycles in Seoul.**

`장안동 사거리` 대여소의 재고 예측 결과 예시입니다.   
각각의 색이 다른 선은 5분~30분후의 예측 결과를 나타내며, 각각 검정과 파랑 라인은 수집된 실제 재고수를 나타냅니다.
아래의 결과는 모델이 단 한번도 학습테이터로 사용되지 않은 데이터를 이용하였습니다.

![example1](/images/result.png)
## 디렉터리별 설명
각 디렉터리에 대한 설명입니다.

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
