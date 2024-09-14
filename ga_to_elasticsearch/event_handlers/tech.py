from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config



def fetch_tech_overview_data():
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [{'name': 'activeUsers'}],
            'dimensions': [
                {'name': 'deviceCategory'},
                {'name': 'operatingSystem'},
                {'name': 'browser'},
                {'name': 'screenResolution'}
            ]
        }
    ).execute()
    return response

def transform_tech_data(response):
    documents = []
    for row in response.get('rows', []):
        document = {
            'deviceCategory': row['dimensionValues'][0]['value'],
            'operatingSystem': row['dimensionValues'][1]['value'],
            'browser': row['dimensionValues'][2]['value'],
            'screenResolution': row['dimensionValues'][3]['value'],
            'activeUsers': int(row['metricValues'][0]['value'])
        }
        documents.append(document)
    return documents

def process_tech_data():
    es = get_es_client()
    create_index(es, 'tech_overview_data')
    tech_data = fetch_tech_overview_data()
    transformed_data = transform_tech_data(tech_data)
    index_data(es, 'tech_overview_data', transformed_data)
