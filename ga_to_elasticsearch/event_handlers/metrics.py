from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config

def fetch_pages_and_screens_data():
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [
                {'name': 'screenPageViews'},       # Views
                {'name': 'activeUsers'},           # Users
                {'name': 'userEngagementDuration'} # Avg. Engagement Time
            ],
            'dimensions': [
                {'name': 'pagePathPlusQueryString'} # Page Path
            ]
        }
    ).execute()
    return response

def transform_pages_and_screens_data(response):
    documents = []
    for row in response.get('rows', []):
        document = {
            'pagePathPlusQueryString': row['dimensionValues'][0]['value'],
            'screenPageViews': int(row['metricValues'][0]['value']),
            'activeUsers': int(row['metricValues'][1]['value']),
            'userEngagementDuration': float(row['metricValues'][2]['value'])  
        }
        documents.append(document)
    return documents

def process_pages_and_screens_data():
    es = get_es_client()
    create_index(es, 'pages_and_screens_data')
    pages_and_screens_data = fetch_pages_and_screens_data()
    transformed_data = transform_pages_and_screens_data(pages_and_screens_data)
    index_data(es, 'pages_and_screens_data', transformed_data)
