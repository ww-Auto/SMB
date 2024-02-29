/***********************************************************************
 
    PD API Request Process
    Process : S28_1203_rq.js
    Writer  : JK
    Data    : 2022-07-06
 
 ***********************************************************************/
const xlsx = require('xlsx');
const fs = require('fs');
const { getPDAPI } = require('../lib/getPDAPI.js');
const { getCurrentDate } = require('../lib/getDate.js');

var at = 0;
var today = getCurrentDate();

// Check Directory
const dir = fs.existsSync("../result/PD_API_Result");
if (!dir) fs.mkdirSync("../result/PD_API_Result");

// Save in NAS
// const todayNas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// if(!todayNas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// const nas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");
// if(!nas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");

// Loading Search API Data
// var filePath = "Y:/smb/2024smb/sit/data/2024-01-23/Search_API_Result/"
var filePath = "../outputs/api/search";

fs.readdir(filePath, function (err, file) {
    for (var a = 0; a < file.length; a++) {


        fs.readFile(filePath + '/' + file[a], 'utf8', (error, jsonFile) => {
            var jsonData = JSON.parse(jsonFile);
            var promiseList = new Array();

            for (var b = 0; b < jsonData.length; b++) {
                var sSKU = jsonData[b].modelCode;
                var sitecode = jsonData[0].sitecode;
                var api_temp = getPDAPI(sSKU, sitecode);
                if (api_temp != "") promiseList.push(api_temp);
            }

            Promise.all(promiseList).then((data) => {
                data = data.reduce(function (acc, cur) {
                    return acc.concat(cur);
                });
                data = data.reduce(function (acc, cur) {
                    return acc.concat(cur);
                });

                const result = JSON.stringify(data, null, 2);
                var cur_sc = data[0].Site;

                // Creat Json File
                fs.writeFileSync('../result/PD_API_Result/PD_API_' + cur_sc + '.json', result);
                console.log("PD_API_" + cur_sc + "_JSON File Saved!");

                // Creat Excel File
                const workBook = xlsx.utils.book_new();
                var workSheet = xlsx.utils.json_to_sheet(data);
                xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
                xlsx.writeFile(workBook, "../result/PD_API_Result/PD_API_" + cur_sc + '.xlsx');

            });
        });
    }
});
