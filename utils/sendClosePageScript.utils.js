const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger.utils');
module.exports = function sendClosePageScript(res) {
  const filePath = path.join(__dirname, '..', 'views', 'closePage.html');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      logger.error('Error reading HTML file:', err);
      res.status(500).send('Error loading page.');
      return;
    }
    res.send(data);
  });
};

