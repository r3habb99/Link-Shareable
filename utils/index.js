const { sendClosePageScript } = require('./sendClosePageScript.utils');
const getFormattedTimestamp = require('./formattedTimeStamp.utils');
const logger = require('../utils/logger.utils');

module.exports = {
  sendClosePageScript,
  getFormattedTimestamp,
  logger,
};
