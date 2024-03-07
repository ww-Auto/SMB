/***********************************************************************
 
    PF_Guest Request Process
    Process : cluster_PD.js

    사용법
    1. config >> url.json 파일에서 url 경로 확인
    2. main에 PF_remote 실행
    3. 데이터만 출력시 실행법
        cluster 터미널 연 후 cluster_PF guest로 실행

    실행과정
    1. cluster_PF.js 사용법에 따라서 터미널에서 실행시
    2. crawling_PF.js에서 작업
    3. 결과 값을 출력

    실행 결과 예시
    {
        "status": "fulfilled",
        "value": [
        {
            "NUM": 1,
            "PF_URL": "https://www.samsung.com/cl/business/smartphones/all-smartphones/",
            "PF_SKU": "SM-F946BLBJLTL",
            "PF_DISPLAYNAME": "Galaxy Z Fold5",
            "PF_COLOR": "Icyblue",
            "PF_MEMORY": "256 GB",
            "PF_PRICE_PROMOTION": "",
            "PF_PRICE_SAVE": "",
            "PF_PRICE_ORIGINAL": "",
            "PF_TIERED_MIN": "",
            "PF_TIERED_PRICE": "",
            "CTA_1_STOCK": "",
            "CTA_1_URL": "",
            "CTA_2_STOCK": "learnMore",
            "CTA_2_URL": "/cl/business/smartphones/galaxy-z/galaxy-z-fold5-for-business-sm-f946blbjltl/"
        }
    
 ***********************************************************************/

const fs = require('fs');
const cluster = require('cluster');
const task = require("../crawling/crawling_PF.js");
const urlList = JSON.parse(fs.readFileSync('../../../config/url.json'));

if(cluster.isMaster) {
    var sitearr = Object.keys(urlList);
    var checkarr = new Object();
    var now = 0;
    var total = 0;
    
    for(var Tsite of sitearr) {
        checkarr[Tsite] = "Ready";
        total++;
    }

    var worker = cluster.fork({'site': sitearr[now], 'mode': 'guest'});

    // When worker is created
    cluster.on('online', function(worker) {
        //console.log('Worker ID : ' + worker.process.pid);
        checkarr[Object.keys(checkarr)[now]] = "Loading";
    });

    // When worker is dead
    cluster.on('exit', (worker, code, signal) => {
        // if Worker worked well
        if(checkarr[Object.keys(checkarr)[now]] == "Done") {
            now++;
            if(now != total) createWorker(sitearr[now], 'guest');
            else {
                notice();
                console.log();
                console.log("All Working is done!!")
            }
        }
        // if Worker couldn't work, Retry same working
        else if(checkarr[Object.keys(checkarr)[now]] == "Ready") {
            checkarr[Object.keys(checkarr)[now]] = "Retry";
            worker = cluster.fork({'site': sitearr[now], 'mode': 'guest'});
        }
        // if Retrying work also couldn't work, Skip and go to next work
        else {
            checkarr[Object.keys(checkarr)[now]] = "Error";
            now++;
            if(now != total) createWorker(sitearr[now], 'guest');
            else {
                notice();
                console.log("All Working is done!!")
            }
        }
    });
    
    /////////////////////////////////////// Create Worker Funtion ///////////////////////////////////////////
    function createWorker(site, mode) {
        var worker = cluster.fork({'site': site, 'mode': mode});
        worker.on('message', function (msg) {
            if(msg.type == "end"){
                checkarr[Object.keys(checkarr)[now]] = "Done";
            } else {
                arr[msg.NUM] = [msg.AEM, msg.SMB, msg.CARD, msg.PAGE, msg.now, msg.total];
                notice();
            }
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////// Notice Function //////////////////////////////////////////////
    var k = 0;
    var arr = [];
    for(var j = 0; j < Object.values(urlList)[0].length; j++) {
        arr[j] = [0,0,0,"",0,0];
    }

    //   In Arr         0           1            2             3            4          5
    // { 'NUM': i, 'AEM': aem, 'SMB': smb, 'CARD': card, 'PAGE': page, 'now': n, 'total': t }
    // Wating : 1 / Success : 2 / Fail : 3

    worker.on('message', function (msg) {
        if(msg.type == "end"){
            checkarr[Object.keys(checkarr)[now]] = "Done";
        } else {
            arr[msg.NUM] = [msg.AEM, msg.SMB, msg.CARD, msg.PAGE, msg.now, msg.total];
            notice();
        }
    });

    function notice() {
        console.clear();
        console.log("--------------------------------- Progress ---------------------------------");
        for( k = 0; k < arr.length; k++){
            if(arr[k][0] == 1 && arr[k][2] == 0) console.log("[Connection AEM] " + arr[k][3]);
            else if(arr[k][0] == 2 && arr[k][2] == 0) console.log("[AEM Connect Success] " + arr[k][3]);
            else if(arr[k][0] == 3 && arr[k][2] == 0) console.log("[Connecting Fail] " + arr[k][3]);
            else if(arr[k][1] == 1 && arr[k][2] == 0) console.log("[Try SMB Login] " + arr[k][3]);
            else if(arr[k][1] == 2 && arr[k][2] == 0) console.log("[SMB Login Success] " + arr[k][3]);
            else if(arr[k][1] == 3 && arr[k][2] == 0) console.log("[SMB Login Fail] " + arr[k][3]);
            else if(arr[k][2] == 1) console.log("[Searching Cards] " + arr[k][3]);
            else if(arr[k][2] == 2) console.log("(" + arr[k][4] + "/" + arr[k][5] + ") : " + arr[k][3]);
            else if(arr[k][2] == 3) console.log("[Not Found Cards] " + arr[k][3]);
        }
        console.log("----------------------------------------------------------------------------");
        process.stdout.write(" | ");
          
        for(var i = 0 ; i < Object.keys(checkarr).length; i++) {
            process.stdout.write(Object.keys(checkarr)[i] + " : " + Object.values(checkarr)[i] + " | ");
        }    
        
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////

} else {
    process.setMaxListeners(50);
    task(cluster.worker.process.env.site, cluster.worker.process.env.mode);   
}
