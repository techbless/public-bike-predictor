# !pip install flask
# !pip install flask_cors
# !pip install apscheduler

import os
import json
import time
import requests
import functools
import pymysql

from flask import Flask, Response
from flask_cors import CORS, cross_origin
from datetime import datetime, timedelta
from itertools import product, repeat

import numpy as np
import pandas as pd

import keras
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

from model import create_model
import joblib

from multiprocessing import cpu_count, Pool, Process

tf.config.threading.set_intra_op_parallelism_threads(2)
tf.config.threading.set_inter_op_parallelism_threads(1)

from dotenv import load_dotenv
load_dotenv()

import threading

from apscheduler.schedulers.background import BackgroundScheduler


app = Flask(__name__)
cors = CORS(app, resources={r'*': {'origins': '*'}})
API_KEY = os.getenv('API_KEY')

print(os.getenv('MYSQL_DATABASE'))

nCores = cpu_count()


def cache(seconds: int, maxsize: int = 10000, typed: bool = False):
    def wrapper_cache(func):
        func = functools.lru_cache(maxsize=maxsize, typed=typed)(func)
        func.delta = timedelta(seconds=seconds)
        func.expiration = datetime.utcnow() + func.delta

        @functools.wraps(func)
        def wrapped_func(*args, **kwargs):
            if datetime.utcnow() >= func.expiration:
                func.cache_clear()
                func.expiration = datetime.utcnow() + func.delta

            return func(*args, **kwargs)

        return wrapped_func

    return wrapper_cache


# DB_CONN INFOS
DB_USER = os.getenv('MYSQL_USER')
DB_PASSWD = os.getenv('MYSQL_PASSWORD')
DB_HOST = os.getenv('MYSQL_HOST')
DB_DB = os.getenv('MYSQL_DATABASE')
MODELS_PATH = "./models/"

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


def requestCurrentInfo(startIdx, endIdx):
    url = "http://openapi.seoul.go.kr:8088/{}/json/bikeList/{}/{}".format(API_KEY, startIdx, endIdx)
    res = requests.get(url)
    res = res.json()
    
    if res['rentBikeStatus']['RESULT']['CODE'] != 'INFO-000':
        raise Exception('Failed to get data from api.')
    
    return res['rentBikeStatus']['row']

def getAllCombinedInfo():
    res = []
    for i in range(1, 1001 + 1, 1000):
        startIdx = i
        endIdx = i + 999
        res = res + requestCurrentInfo(startIdx, endIdx)
        
    return res



def get_available_stations():
    def isAvailableStation(station):
        if station['stationId'] in availableStations:
            return station
        else:
            return None
    
    file_list = os.listdir(MODELS_PATH)
    
    availableStations = list(map(lambda x: x.split('.')[0], file_list))
    allStations = getAllCombinedInfo()
    availableStations = list(filter(isAvailableStation, allStations))
    
    return availableStations


def get_last_10rows(stationId):
    sql = """
    SELECT parkingBikeTotCnt FROM (
        SELECT parkingBikeTotCnt, idx FROM `{}` ORDER BY idx DESC LIMIT 10
    ) sub
    ORDER BY idx ASC
    """.format(stationId)

    cursor.execute(sql)
    res = cursor.fetchall()
    res = [row['parkingBikeTotCnt'] for row in res]
    
    return np.array(res)


models = {}
def load_models():
    global models
    models.clear()
    
    file_list = os.listdir(MODELS_PATH)
    stations = list(map(lambda x: x.split('.')[0], file_list))
    
    for stationId in stations:
        path = "./models/{}.h5".format(stationId)
        model = keras.models.load_model(path)
        models[stationId] = model

def get_scaler(stationId):
    file_name = './scalers/{}.pkl'.format(stationId)
    scaler = joblib.load(file_name)
    
    return scaler

def predict(model, scaler, x):
    x = tf.keras.backend.constant(x)
    y = model(x, training=False).numpy()
    y = y.reshape(y.shape[0], y.shape[1])
    y = scaler.inverse_transform(y)
    y = y.reshape(y.shape[1])
    y = y.astype(int)
    
    return y.tolist()

def forecastFutureOfStation(station):
    stationId = station['stationId']
    model = models[stationId]
    x = get_last_10rows(stationId)
    
    scaler = get_scaler(stationId)
    x = scaler.fit_transform(pd.DataFrame(x))
    x = x.reshape(1, x.shape[0], 1)
    
    station['future'] = predict(model, scaler, x)
    
    return station


load_models()

sched = BackgroundScheduler()
sched.add_job(load_models, 'cron', hour='3') # every at 03:00 AM
sched.start()


@cache(seconds=240*60)
def get_stations():
    availableStations = get_available_stations()
    
    with Pool(nCores, maxtasksperchild=16) as pool:
        result = pool.map(forecastFutureOfStation, availableStations)
        
    resultInJson = json.dumps(result, ensure_ascii=False)
    return resultInJson


@app.route("/stations/available")
@cross_origin()
def get_all_stations():
    return Response(get_stations(), mimetype='application/json')


@app.route("/station/<stationId>/history")
@cross_origin()
def get_history(stationId):    
    sql = """
    SELECT datetime, parkingBikeTotCnt FROM (
        SELECT * FROM `{}` ORDER BY idx DESC LIMIT 50
    ) sub
    ORDER BY idx ASC
    """.format(stationId)
    
    cursor.execute(sql)
    history = cursor.fetchall()
    
    resultInJson = json.dumps(history, ensure_ascii=False)
    return Response(resultInJson, mimetype='application/json')


if __name__ == '__main__':
    app.run(host='0.0.0.0', processes=1, threaded=False)
