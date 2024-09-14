# google_analytics.py
from google.oauth2 import service_account
from googleapiclient.discovery import build
import config

SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']

def initialize_analytics():
    credentials = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('analyticsdata', 'v1beta', credentials=credentials)
