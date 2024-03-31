const winston = require('winston')
const config = require('../config/config')



const logger = winston.createLogger(
    {
        levels: {
            fatal: 0,
            error: 1,
            warning: 2,
            info: 3,
            http: 4,
            debug: 5,
        },
        transports: [
            new winston.transports.Console(
                {
                    level: "info",
                    format: winston.format.combine(
                        (winston.format((info)=>{
                            if(info.level==="info"){
                                info.fecha=new Date().toUTCString()
                                return info
                            }
                        }))(),
                        winston.format.colorize({
                            colors: {
                                info: "cyan",
                            },
                        }
                        ),
                        winston.format.simple(),
                    ),
                }
            ),

            new winston.transports.Console(
                {
                    level: "warning",
                    format: winston.format.combine(
                        (winston.format((info)=>{
                            if(info.level==="warning"){
                                info.fecha=new Date().toUTCString()
                                return info
                            }
                        }))(),
                        winston.format.colorize({
                            colors: {
                                warning: "yellow",
                            },
                        }
                        ),
                        winston.format.simple(),
                    ),
                }
            ),

            new winston.transports.Console(
                {
                    level: "error",
                    format: winston.format.combine(
                        (winston.format((info)=>{
                            if(info.level==="error"){
                                info.fecha=new Date().toUTCString()
                                return info
                            }
                        }))(),
                        winston.format.colorize({
                            colors: {
                                error: "red",
                            },
                        }
                        ),
                        winston.format.simple(),
                    ),
                }
            ),

            new winston.transports.Console(
                {
                    level: "fatal",
                    format: winston.format.combine(
                        (winston.format((info)=>{
                            if(info.level==="fatal"){
                                info.fecha=new Date().toUTCString()
                                return info
                            }
                        }))(),
                        winston.format.colorize({
                            colors: {
                                fatal: "magenta",
                            },
                        }
                        ),
                        winston.format.simple(),
                    ),
                }
            ),

            new winston.transports.File(
                {
                    level: "fatal",
                    filename: "../src/logs/fatalLogs.log",
                    format: winston.format.combine(
                        
                        winston.format.timestamp(),
                        winston.format.json(),
                    )
                }
            ),

            new winston.transports.File(
                {
                    level: "error",
                    filename: "../src/logs/errorLogs.log",
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),

        ],
    }
)



const DebugConsola = new winston.transports.Console(
    {
        level: "debug",
        format: winston.format.combine(
            (winston.format((info)=>{
                if(info.level==="debug"){
                    info.fecha=new Date().toUTCString()
                    return info
                }
            }))(),
            winston.format.prettyPrint(),
        ),
    }
)

const httpConsola = new winston.transports.Console(
    {
        level: "http",
        format: winston.format.combine(
            (winston.format((info)=>{
                if(info.level==="http"){
                    info.fecha=new Date().toUTCString()
                    return info
                }
            }))(),
            winston.format.colorize({
                colors: {
                    http: "green",
                },
            }
            ),
            winston.format.simple(),
        ),
    }
)





if (config.MODE === "desarrollo") {
    logger.info("modo desarrollo");
    logger.add(DebugConsola)
    logger.add(httpConsola)
}

const middLogg = (req, res, next) => {
    req.logger = logger

    next()
}

module.exports = { middLogg, logger  };