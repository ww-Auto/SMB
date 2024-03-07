/***********************************************************************
 
    PD_Guest, Include, Exclude Request Process
    Process : cluster_PD.js

    사용법
    1. config.js에서 sitecode, siteInEx 국가 확인
    2. cluster 터미널 연 후 cluster_PD 실행
    3. cluster_PD 실행은 task에 Guest나 Include, Exclude 하나씩 실행
    4. 실행 방법
        node [스크립트 파일명] 3 Include lt ee za
            - 워커 갯수 >> Default : 2
            - Mode (Guest / Include / Exclude) >> Default : Guest
            - SiteCodes >> Default : all site 

    실행과정
    1. cluster_PD.js 사용법에 따라서 터미널에서 실행시
    2. crawling_noEnti.js에서 작업
    3. 결과 값을 출력

    실행 결과 예시
    {
        "PF_URL": "https://www.samsung.com/cl/business/smartphones/all-smartphones/",
        "SKU": "SM-F731BLGKLTL",
        "PF_NUM": "",
        "PF_DISPLAYNAME": "",
        "PF_COLOR": "",
        "PF_MEMORY": "",
        "PF_PRICE_PROMOTION": "",
        "PF_PRICE_SAVE": "",
        "PF_PRICE_ORIGINAL": "",
        "PF_TIERED_MIN": "",
        "PF_TIERED_PRICE": "",
        "BUY_NOW_CTA_URL": "",
        "BUY_NOW_CTA_STOCK": "",
        "BUY_NOW_PD_TYPE": "",
        "BUY_NOW_FEATURE_Promotion_Price": "",
        "BUY_NOW_FEATURE_Original_Price": "",
        "BUY_NOW_FEATURE_Save_Price": "",
        "BUY_NOW_BC_Promotion_Price": "",
        "BUY_NOW_BC_Original_Price": "",
        "BUY_NOW_BC_Save_Price": "",
        "LEARN_MORE_CTA_URL": "",
        "LEARN_MORE_CTA_STOCK": "",
        "LEARN_MORE_PD_TYPE": "",
        "LEARN_MORE_FEATURE_Promotion_Price": "",
        "LEARN_MORE_FEATURE_Original_Price": "",
        "LEARN_MORE_FEATURE_Save_Price": "",
        "LEARN_MORE_BC_Promotion_Price": "",
        "LEARN_MORE_BC_Original_Price": "",
        "LEARN_MORE_BC_Save_Price": "",
        "PD_Tiered_Min": "",
        "PD_Tiered_Price": "",
        "Cart_Price": "",
        "Cart_Quantity": "",
        "Cart_URL": "",
        "Comment": "OnlyAPI"
    } 
    
 ***********************************************************************/
const cluster = require('cluster');
const { sitecode } = require('../../../config/config.js');

let args = process.argv;
let workerCount = parseInt(args[2]) || 2; // 워커 개수를 커맨드 라인 인자로부터 받음, 기본값은 2
let mode = args[3] || "Guest"; // 모드를 커맨드 라인 인자로부터 받음, 기본값은 "DefaultMode"

// 커맨드 라인 인자로부터 사이트 리스트를 가져오는 함수
function getSiteList(){
    let siteList = new Array();

    // 네 번째 인자부터 사이트 리스트로 간주
    if(args.length > 4) {
        for(let i = 4; i < args.length; i++){
            siteList.push(args[i]);
        }
    } else {
        // 인자가 없는 경우, 기본 사이트 리스트 사용
        siteList = sitecode;
    }
    return siteList;
}

let workerStatus = {};

if(cluster.isMaster) {
    let siteList = getSiteList();
    let sitesPerWorker = Math.ceil(siteList.length / workerCount);
    let activeWorkers = workerCount; // 활성 워커 수를 추적
    let intervalId; // setInterval ID를 저장

    // 워커별로 사이트 리스트 분할 및 워커 생성
    for(let i = 0; i < workerCount; i++) {
        let start = i * sitesPerWorker;
        let end = start + sitesPerWorker;
        let workerSites = siteList.slice(start, end);
        createWorker(workerSites, `Worker${i + 1}`, mode);
    }

    // 워커 생성 및 초기화 함수
    function createWorker(siteArray, workerLabel, mode) {
        let worker = cluster.fork({'sites': siteArray.join(','), 'label': workerLabel, 'mode': mode});
        //workerStatus[workerLabel] = { sites: siteArray, completed: 0 };
        workerStatus[workerLabel] = {  // 워커 상태표시 체크를 위한 배열
            working: null, 
            ready: [...siteArray], 
            done: [], 
            log : []
        };
        
        // 워커로부터 메시지 수신 시 처리
        worker.on('message', function (msg) {
            if(msg.type === 'siteStarted') {
                workerStatus[msg.label].working = msg.site;
                let index = workerStatus[msg.label].ready.indexOf(msg.site);
                if (index > -1) {
                    workerStatus[msg.label].ready.splice(index, 1);
                }
                //notice();
            } else if(msg.type === 'siteCompleted') {
                workerStatus[msg.label].done.push(msg.site);
                workerStatus[msg.label].working = null;
                notice();

                // 모든 사이트 작업이 완료되었는지 확인
                if(workerStatus[msg.label].ready.length === 0 && workerStatus[msg.label].working === null) {
                    activeWorkers--;
                    worker.kill(); // 워커 종료
                    if(activeWorkers === 0) {
                        clearInterval(intervalId); // 모든 워커가 작업을 완료했으므로 타이머 중지
                    }

                    console.log(activeWorkers, "워커 전체 종료!!!!!!!!!!!!!!!!!!!"); 
                }
            }
        });

        // 30초마다 진행 상황을 확인하는 setInterval 설정
        setInterval(notice, 30000); // 10000ms = 10초
    }

    // 진행 상황을 콘솔에 출력하는 함수
    function notice() {
        console.clear();
        console.log("------------- 진행 상황 -------------");
        for(let label in workerStatus) {
            let status = workerStatus[label];
            console.log(`${label}: Working: ${status.working || 'None'}, Ready: [${status.ready.join(', ')}], Done: [${status.done.join(', ')}]`);

            // // 추가된 로그 메시지 출력
            // if(status.log && status.log.length > 0) {
            //    console.log(`--- ${label} 로그 메시지 ---`);
            //    status.log.forEach(logMsg => {
            //        console.log(`Site: ${logMsg.site}, Mode: ${logMsg.mode}, URL: ${logMsg.url}, Now: ${logMsg.now}, Total: ${logMsg.total}`);
            //    });
            //}
        }
        console.log("------------------------------------");
    }

    // 워커 종료 시 처리
    cluster.on('exit', (worker, code, signal) => {
        // 워커 종료 시 필요한 로직 추가
    });

} else {
    process.setMaxListeners(50);
    var task = require("../crawling/crawling_noEnti.js");
    let sites = cluster.worker.process.env.sites.split(',');
    let label = cluster.worker.process.env.label;
    let mode = cluster.worker.process.env.mode; // 모드 환경 변수 받기

    // 할당된 사이트에 대해 작업 수행 (순차적 실행)
    async function executeTasksSequentially() {
        for (const site of sites) {
            process.send({ type: 'siteStarted', label: label, site: site });
            await task(site, mode);
            process.send({ type: 'siteCompleted', label: label, site: site });
        }
    }

    executeTasksSequentially();
}

