// src/ga4.js
import ReactGA from 'react-ga4';


const GA_MEASUREMENT_ID = 'G-1M7YGKC3FH'; 
window.gtag('set', 'debug_mode', true);


export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({ category, action, label });
};



export const logReadEvent = (story_title, read_duration) => {
  if (window.gtag) {
    window.gtag('event', 'read_story', {
      story_title,
      read_duration
    });
  }
};
