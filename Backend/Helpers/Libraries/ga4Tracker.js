// Helpers/Libraries/ga4Tracker.js

const measurement_id = 'G-1M7YGKC3FH';
const api_secret = '0VjhjQJ1QkqdytiQurp1Tw';

// Function to send events to GA4
const sendEventToGA4 = async (event) => {
    try {
        // Ensure that the duration is included in the event parameters
        const eventParams = {
            ...event.params,  // Include all existing parameters
            duration: event.params.duration || 0  // Add duration, defaulting to 0 if not provided
        };

        const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'YOUR_CLIENT_ID', 
                events: [{
                    name: event.name,  
                    params: eventParams  
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Event sent to GA4 successfully.');
    } catch (error) {
        console.error('Error sending event to GA4:', error.message);
    }
};

module.exports = { sendEventToGA4 };
