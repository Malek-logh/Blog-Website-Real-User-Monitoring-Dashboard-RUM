from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config

def fetch_other_events_data(event_name):
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [
                {'name': 'eventCount'},
                {'name': 'customEvent:read_duration'}
            ],
            'dimensions': [
                {'name': 'eventName'},
                {'name': 'customEvent:story_title'}
            ],
            'dimensionFilter': {
                'filter': {
                    'fieldName': 'eventName',
                    'stringFilter': {
                        'value': event_name  # Filter for specific events
                    }
                }
            }
        }
    ).execute()
    return response

def transform_other_events_data(response):
    documents = []
    for row in response.get('rows', []):
            dimension_values = row.get('dimensionValues', [])
            metric_values = row.get('metricValues', [])
            document = {
                    'eventName': dimension_values[0]['value'],
                    'storyTitle': dimension_values[1]['value'],
                    'read_duration': float(metric_values[1]['value']),
                    'eventCount': int(metric_values[0]['value'])
            }
            documents.append(document)
    return documents

def process_other_events():
    es = get_es_client()
    create_index(es, 'other_events_data')
    
    # Process specific events
    event_name = 'Read_story'
    response = fetch_other_events_data(event_name)
    transformed_data = transform_other_events_data(response)
    index_data(es, 'other_events_data', transformed_data)
