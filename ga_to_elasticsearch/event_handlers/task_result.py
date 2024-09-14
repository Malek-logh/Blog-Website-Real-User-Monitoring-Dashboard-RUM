from google_analytics import initialize_analytics
from elasticsearch_client import get_es_client, create_index, index_data
import config

def fetch_task_result_data():
    analytics = initialize_analytics()
    response = analytics.properties().runReport(
        property=f'properties/{config.GA4_PROPERTY_ID}',
        body={
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'today'}],
            'metrics': [
                {'name': 'eventCount'}
            ],
            'dimensions': [
                {'name': 'eventName'},
                {'name': 'customEvent:taskName'},
                {'name': 'customEvent:taskResult'}
            ],
            'dimensionFilter': {
                'filter': {
                    'fieldName': 'eventName',
                    'stringFilter': {
                        'value': 'task_result'  # Filter for task_result event
                    }
                }
            }
        }
    ).execute()
    return response

def transform_task_result_data(response):
    documents = []
    if response and 'rows' in response:
        for row in response.get('rows', []):
            dimension_values = row.get('dimensionValues', [])
            metric_values = row.get('metricValues', [])
            
            # Ensure dimensions and metrics are correctly retrieved
            if len(dimension_values) >= 3 and len(metric_values) >= 1:
                document = {
                    'eventName': 'task_result',
                    'taskName': dimension_values[1]['value'],  # 'taskName' is the 2nd dimension
                    'taskResult': dimension_values[2]['value'],  # 'taskResult' is the 3rd dimension
                    'eventCount': int(metric_values[0]['value'])  # 'eventCount' is the 1st metric
                }
                documents.append(document)
    return documents

def process_task_result():
    es = get_es_client()
    create_index(es, 'task_result_data')
    
    # Fetch and process the task_result event
    response = fetch_task_result_data()
    transformed_data = transform_task_result_data(response)
    index_data(es, 'task_result_data', transformed_data)
