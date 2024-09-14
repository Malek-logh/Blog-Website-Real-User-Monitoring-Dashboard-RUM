# elasticsearch_client.py
from elasticsearch import Elasticsearch
import config

def get_es_client():
    return Elasticsearch([config.ELASTICSEARCH_HOST])

def create_index(es, index_name):
    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name)

def index_data(es, index_name, data):
    for document in data:
        es.index(index=index_name, body=document)
