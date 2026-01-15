# test_mongo.py
from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print(" MongoDB is running and accessible!")
except Exception as e:
    print(f" Cannot connect to MongoDB: {e}")