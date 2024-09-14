# event_handlers/page_views.py
from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config


def fetch_page_views_data():
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
         property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [{'name': 'eventCount'}],
            'dimensions': [{'name': 'pagePath'}],
            'dimensionFilter': {
                'filter': {
                    'fieldName': 'eventName',
                    'stringFilter': {
                        'value': 'page_view'  # Filter for page views
                    }
                }
            }
        }
    ).execute()
    return response

def transform_page_views_data(response):
    documents = []
    for row in response['rows']:
        document = {
            'pagePath': row['dimensionValues'][0]['value'],
            'eventCount': int(row['metricValues'][0]['value'])
        }
        documents.append(document)
    return documents

def process_page_views():
    es = get_es_client()
    create_index(es, 'page_views_data')
    response = fetch_page_views_data()
    transformed_data = transform_page_views_data(response)
    index_data(es, 'page_views_data', transformed_data)

