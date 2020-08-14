import keras
import tensorflow as tf
from keras import optimizers
from keras.models import Sequential
from keras.layers import Dense, LSTM, TimeDistributed, RepeatVector

def create_model():
    model = Sequential()
    
    model.add(LSTM(25, activation='linear', input_shape=(10, 1)))
    model.add(RepeatVector(6))
    model.add(LSTM(25, activation='linear', return_sequences=True))
    model.add(TimeDistributed(Dense(1)))
    
    return model