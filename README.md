# public-bike-predictor

**서울시 공공자전거 따릉이의 미래 재고수를 예측합니다.**   

`아래를 클릭하여 PC환경의 데모 영상을 확인하실 수 있습니다.`
[![Watch the video](/images/youtube_img.png)](https://youtu.be/6uYB1pHMwKI)

`장안동 사거리` 대여소의 재고 예측 결과 예시입니다.   
각각의 색이 다른 선은 5분~30분후의 예측 결과를 나타내며, 검정색 라인은 수집된 실제 재고수를 나타냅니다.
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

### 데이터 수집기 & 재고 예측 모델 및 백엔드 서버
각 서버에서 아래에 명시된 환경변수를 가져야 합니다.

|    환경변수     | 환경변수 값 |
|----------------|------------|
| MYSQL_DATABASE | MYSQL DB명 |
| MYSQL_HOST     | MYSQL HOST 주소 |
| MYSQL_USER     | MYSQL 유저명 |
| MYSQL_PASSWORD | MYSQL 비밀번호 |
| API_KEY        | 따릉이 공공 API 인증키 |

## 실행 방법
### 데이터 수집기
데이터 수집기는 모델 학습과 예측을 위해 항시 작동하고 있어야합니다.
``` console
cd ./dataset-collector
npm install
npm build
npm start
```

### 모델 학습 & 백엔드 서버
#### 가상환경 생성
``` console
cd ./predictor
virtualenv myvenv
```

#### 가상환경 진입
``` console
source ./myvenv/bin/activate
```

#### 패키지 설치
``` console
pip install --upgrade pip
pip install python-dotenv
pip install numpy
pip install pandas
pip install tensorflow
pip install keras
pip install matplotlib
pip install sklearn
pip install PyMySQL
pip install flask
pip install flask_cors
pip install apscheduler
```

#### 모델 학습
이 과정은 각 대여소마다 일주일치 데이터를 이용한다고 가정하는 경우, `NCP`클라우드의 `High CPU-g2 C8-g2` 환경에서 6시간 30분 이상 소요됩니다.   
높은 정확도를 위해서는 훨씬 더 많은 데이터를 이용해야 합니다. 이 경우 `GPU`의 사용을 권장합니다.
``` console
python train_models.py
```

#### 백엔드 서버
서버 실행 후, 모델이 로드되고 시작되는데 까지 약 5분이 소요됩니다.
``` console
python server.py
```

### 프론트엔드
``` console
cd ./frontend
npm install
npm build
serve ./build -p 80
```
