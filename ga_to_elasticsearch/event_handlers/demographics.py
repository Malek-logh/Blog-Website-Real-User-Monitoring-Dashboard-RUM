from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config

def fetch_demographic_data():
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [
                {'name': 'activeUsers'},
                {'name': 'userEngagementDuration'}
            ],
            'dimensions': [
                {'name': 'country'}
            ]
        }
    ).execute()
    return response

def transform_demographic_data(response):
    documents = []
    for row in response.get('rows', []):
        document = {
            'country': row['dimensionValues'][0]['value'],
            'activeUsers': int(row['metricValues'][0]['value']),
            'userEngagementDuration': float(row['metricValues'][1]['value'])
        }
        documents.append(document)
    return documents

def process_demographic_data():
    es = get_es_client()
    create_index(es, 'demographic_data')
    demographic_data = fetch_demographic_data()
    transformed_data = transform_demographic_data(demographic_data)
    index_data(es, 'demographic_data', transformed_data)
