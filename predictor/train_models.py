# !pip install --upgrade pip
# !pip install python-dotenv
# !pip install numpy
# !pip install pandas
# !pip install tensorflow
# !pip install keras
# !pip install matplotlib
# !pip install sklearn
# !pip install PyMySQL

debug = True

from dotenv import load_dotenv

import os
import time
import multiprocessing
import pymysql
import joblib

from model import create_model


import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.preprocessing import MinMaxScaler

import keras
import tensorflow as tf
from keras import optimizers

tf.config.threading.set_intra_op_parallelism_threads(2)
tf.config.threading.set_inter_op_parallelism_threads(1)

load_dotenv()


# DB_CONN INFOS
DB_USER = os.getenv('MYSQL_USER')
DB_PASSWD = os.getenv('MYSQL_PASSWORD')
DB_HOST = os.getenv('MYSQL_HOST')
DB_DB = os.getenv('MYSQL_DATABASE')

# Connect to db
db = pymysql.connect(
    user=DB_USER, 
    passwd=DB_PASSWD, 
    host=DB_HOST, 
    db=DB_DB, 
    charset='utf8'
)

# Set cursor
cursor = db.cursor(pymysql.cursors.DictCursor)

# Get all stations ids in database
sql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = %s;"
nRows = cursor.execute(sql, DB_DB)
stationIds = cursor.fetchall()
stationIds = [stationId['TABLE_NAME'] for stationId in stationIds]
#stationIds = stationIds[:30]

start = time.time()

count = 0
data = {}
for stationId in stationIds:
    sql = "SELECT parkingBikeTotCnt FROM `{}`".format(stationId)
    count += cursor.execute(sql)
    res = cursor.fetchall()
    
    tempdf = pd.DataFrame(res)
    y = pd.DataFrame(tempdf.parkingBikeTotCnt)

    scaler = MinMaxScaler()
    y = scaler.fit_transform(y)
    
    file_name = 'scalers/{}.pkl'.format(stationId)
    joblib.dump(scaler, file_name)
    
    # filter only dataset which have more than 1k data
    # IMPORTANT: This is very important to ensure safe training.
    #            because some stations' dataset has very small data.
    if(len(y) > 1000):
        data[stationId] = y
    
print("로딩시간 :", time.time() - start)
print("로드된 데이터 수 :", count)


def create_dataset(dataset, look_back=10, nPredicted = 6):
    dataX, dataY = [], []
    for i in range(len(dataset)-look_back-nPredicted + 1):
        dataX.append(dataset[i:(i+look_back), 0])
        dataY.append(dataset[i + look_back: i + look_back + nPredicted, 0])
        
    dataX, dataY = np.array(dataX), np.array(dataY)
    
    dataX = dataX.reshape(dataX.shape[0], dataX.shape[1], 1)
    dataY = dataY.reshape(dataY.shape[0], dataY.shape[1], 1)
    
    return dataX, dataY


def do_all_task(args):
    model = create_model()
    
    model.compile(optimizer='adam', loss='mse')
    
    if debug:
        start = time.time()
        history = model.fit(args['x'], args['y'], epochs=300, batch_size=64, verbose=0)
        print("[{:^9}] {:>5}초, loss: {}".format(args['key'], round(time.time() - start, 2), round(history.history['loss'][-1:][0], 4)))
    else:
        model.fit(args['x'], args['y'], epochs=200, batch_size=64, verbose=0)
          
    file_name = 'models/{}.h5'.format(args['key'])
    model.save(file_name)


nCores = multiprocessing.cpu_count()
with multiprocessing.Pool(processes=nCores, maxtasksperchild=8) as pool:
    keys = data.keys()
    result = pool.map(create_dataset, [data[key] for key in keys])

    datasets = {}
    idx = 0
    for key in keys:
        datasets[key] = result[idx]
        idx+=1


with multiprocessing.Pool(processes=nCores) as pool:
    start = time.time()
    print("== 학습 시작 ==")
    
    keys = datasets.keys()
    res = pool.map(do_all_task, [{
        'key': key, 
        'x': datasets[key][0], 
        'y': datasets[key][1]
    } for key in keys])
    
    print("\n")
    print("== 학습 완료 == ")
    print("소요 시간 :", round(time.time() - start, 2))