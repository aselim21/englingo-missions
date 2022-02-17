const winston = require('winston')
const { format, transports } = winston
const path = require('path');
require('winston-mongodb');

//DONT USE
// const MongoDB_Logs_URL = process.env.DATABASE_URL; 

//BUG -- Access to fetch at 'https://englingo-missions.herokuapp.com/missions' from origin 'https://englingo.herokuapp.com/' 
//has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' 
//header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the 
//resource with CORS disabled.room.js:377


const logFormat = format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)

function buildProdLogger() {
    return winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp(),
    // Format the metadata object
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    new transports.MongoDB({
        db : 'mongodb+srv://englingo-admin:admin123@cluster0.enlfp.mongodb.net/englingo-missions?retryWrites=true&w=majority',
        useUnifiedTopology: true ,
        collection: 'logs'
    })
  ],
  exitOnError: false
})
}

module.exports = buildProdLogger;