/**
 * Logger Utility - Handles console logging with colors
 */

const colors = require('colors');

class Logger {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  log(message, type = 'info') {
    const time = this.timestamp();
    const prefix = `[${time}]`;

    switch (type) {
      case 'success':
        console.log(colors.green(`${prefix} ${message}`));
        break;
      case 'error':
        console.error(colors.red(`${prefix} ${message}`));
        break;
      case 'warning':
        console.warn(colors.yellow(`${prefix} ${message}`));
        break;
      case 'green':
        console.log(colors.bgGreen.black(`${prefix} ${message}`));
        break;
      case 'magenta':
        console.log(colors.bgMagenta.white(`${prefix} ${message}`));
        break;
      default:
        console.log(colors.blue(`${prefix} ${message}`));
    }
  }
}

module.exports = Logger;
