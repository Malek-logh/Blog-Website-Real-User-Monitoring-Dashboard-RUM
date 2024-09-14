from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config

def fetch_api_calls_data(event_name):
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [
                {'name': 'eventCount'},
                {'name': 'customEvent:comment_count'},
                {'name': 'customEvent:duration'}
            ],
            'dimensions': [
                {'name': 'eventName'}, {'name': 'customEvent:email'},
                {'name': 'customEvent:story_id'}, {'name': 'customEvent:comment_id'},
                {'name': 'customEvent:readtime'}, {'name': 'customEvent:like_status'}
            ],
            'dimensionFilter': {
                'filter': {
                    'fieldName': 'eventName',
                    'stringFilter': {
                        'value': event_name
                    }
                }
            }
        }
    ).execute()
    return response

def transform_api_calls_data(response):
    documents = []
    for row in response.get('rows', []):
        dimension_values = row.get('dimensionValues', [])
        metric_values = row.get('metricValues', [])


        document = {
            'eventName': dimension_values[0]['value'] if len(dimension_values) > 0 else '',
            'email': dimension_values[1]['value'] if len(dimension_values) > 1 else '',
            'story_id': dimension_values[2]['value'] if len(dimension_values) > 2 else '',
            'comment_id': dimension_values[3]['value'] if len(dimension_values) > 3 else '',
            'readtime': dimension_values[4]['value'] if len(dimension_values) > 4 else '',
            'like_status': dimension_values[5]['value'] if len(dimension_values) > 5 else '',
            'comment_count': int(metric_values[1]['value']) if len(metric_values) > 1 else 0,
            'duration': float(metric_values[2]['value']) ,
            'eventCount': int(metric_values[0]['value']) if len(metric_values) > 0 else 0
        }
        documents.append(document)

    return documents

def process_api_calls():
    es = get_es_client()
    create_index(es, 'api_calls_data')
    
    event_names = [
        'private_data_access', 'user_registration', 'user_login', 'password_reset_email_sent', 'password_reset',
        'add_new_comment', 'fetch_all_comments', 'comment_like', 'get_comment_like_status',
        'add_story', 'fetch_all_stories', 'fetch_story_details', 'like_story',
        'fetch_edit_story_page', 'edit_story', 'delete_story'
    ]
    
    for event_name in event_names:
        response = fetch_api_calls_data(event_name)
        transformed_data = transform_api_calls_data(response)
        index_data(es, 'api_calls_data', transformed_data)
