/***********************************************************************
 
    Function : Get API Data
    Process : get_API(targetAPI, targetsite)
    Writer  : JK
    Data    : 2022-05-10
 
 ***********************************************************************/
// Get API data
const { getFetch } = require('../lib/getFetch.js');
const { logger } = require('../lib/logger.js');
const { arraySearchApi } = require('../lib/arraySearchAPI.js');
const { baseURL, extraURL, cookie } = require('../config/config.js');

function get_API(targetAPI, targetsite) {
    return new Promise(async (rs, rj) => {
        var resultList = new Array();
        var productList = new Array()
        var total = 1;
        var retry = 0;
        var check = true;

        for(var u = 0; u < total; u++) {
            
            var start = 1;
            start = start + u;
            var URL = baseURL + "type=" + targetAPI + "&siteCode=" + targetsite + "&start=" + start + extraURL;
            // console.log(URL);
        
            // Check Fetch
            var response = await getFetch(URL, cookie, "Search");
            
            // Check Response API
            if(response.ok) {
                do {
                    let data;
                    try{
                        if(retry > 0) {
                            logger.info("Retry Get Json [Retry: " + retry + "] : " + URL);
                        }
                        data = await response.json();
                        //console.log("Get Json OK...")
                        productList = data.response.resultData.productList;
                        total = data.response.resultData.common.totalRecord;
                        if(data.response.statusCode >= 300) throw "connectError";
                        check = false;
                        if(retry > 0) {
                            logger.info("Get Json retry Pass : " + URL);
                            retry = 0;
                        }
                    } catch (e) {
                        retry++;
                        if(e == "connectError") logger.error("Connection Failed [" + data.response.statusCode + "] : " + URL);   
                        else logger.error("Get Json error : " + URL);
                        response = await getFetch(URL, cookie, "Search");
                        check = true;
                    } 
                } while(check && retry < 5);
                
                if(retry != 0) {
                    logger.error("Cannot Save API Data : " + URL);
                    retry = 0;
                }
                else  console.log(targetsite + "_" + targetAPI + "_Status OK...");

            }

            resultList.push(await arraySearchApi(targetsite, targetAPI, productList, start));

        }

        rs(resultList);
    });
}

module.exports.get_API = get_API;
