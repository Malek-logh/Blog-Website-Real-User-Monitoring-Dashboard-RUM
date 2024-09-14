# main.py
from event_handlers.api_calls import process_api_calls
from event_handlers.page_views import process_page_views
from event_handlers.other_events import process_other_events
from event_handlers.tech import process_tech_data
from event_handlers.metrics import process_pages_and_screens_data
from event_handlers.demographics import process_demographic_data
from event_handlers.task_result import process_task_result





def main():
    process_api_calls()
    process_page_views()
    process_other_events()
    process_tech_data()
    process_pages_and_screens_data()
    process_demographic_data()
    process_task_result()

if __name__ == '__main__':
    main()
