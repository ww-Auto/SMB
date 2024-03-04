/***********************************************************************
 
    Function : Fetch API Url
    Process : getFetch(URL)
    Writer  : JK
    Data    : 2022-05-10
 
 ***********************************************************************/
// Get API data in fetch
// const fetch = require('node-fetch');
const fetch = require('node-fetch');
const { logger } = require('../lib/logger.js');

async function getFetch(URL, cookie, trg) {
    var retry = 0;
    var check = true;
    var cook = cookie;

    do {
        try {
            // URL이 Promise 객체인지 확인하고, Promise라면 해결될 때까지 기다립니다.
            if(URL instanceof Promise) {
                URL = await URL; // URL Promise가 해결될 때까지 기다립니다.
            }

            var response;
            if(trg == "Search") var response = await fetch(URL, { insecureHTTPParser: true});
            else if(trg == "PD") var response = await fetch(URL, {
                                                                    headers: {
                                                                        Cookie: cook,
                                                                        Credential: "include"
                                                                    }
                                                                });
            // console.log("PD Fetch OK...")
            check = false;
            if(retry > 0) {
                logger.info("Fetch retry Pass");
                retry = 0;
            }
        }
        catch(e) {
            console.error(e);
            retry++;
            logger.error("Fetch error [Retry: " + retry + "] : " + URL);
            check = true;
        }

    } while(check);

    return response;
}

module.exports.getFetch = getFetch;
