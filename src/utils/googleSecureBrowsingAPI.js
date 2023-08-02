import fetch from 'node-fetch'; // If you are running this in Node.js

// Function to check the Safe Browsing API for a single URL
export async function checkSafeBrowsing(url, verbose = false) {
  try {
    // Replace 'YOUR_API_KEY' with your actual Safe Browsing API key
    const API_KEY = process.env.SAFE_BROWSING_API_KEY;
    const safeBrowsingURL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

    const payload = {
      "client": {
        "clientId": "lighthouse.storage",
        "clientVersion": "1.5.2"
      },
      "threatInfo": {
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
        "platformTypes": ["WINDOWS"],
        "threatEntryTypes": ["URL"],
        "threatEntries": [
          { "url": url }
        ]
      }
    };

    const response = await fetch(safeBrowsingURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();

      if (verbose) {
        console.log('Safe Browsing API Response:', data);
      }

      return data;
    } else {
      console.error(`Safe Browsing API request failed for URL: ${url}`);
      return null;
    }
  } catch (error) {
    console.error(`Error while checking Safe Browsing for URL: ${url}`, error.message);
    return null;
  }
}
