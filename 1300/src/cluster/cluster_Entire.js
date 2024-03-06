/***********************************************************************
 
    Entire Request Process
    Process : cluster_Entire.js

    사용법
    1. config.js에서 sitecode 국가 확인
    2. cluster 터미널 연 후 cluster_Entire 실행
    3. 시간이 오래 걸리는 작업 다른 작업이 끝나고 마지막에 진행

    실행 결과 예시
    {
        "PF_URL": "https://www.samsung.com/cl/business/smartphones/all-smartphones/",
        "SKU": "SM-F731BZEKLTL",
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
var args = process.argv;

// siteList =  // 11
function getSiteList(){
    // let siteList = new Array();
    // let siteList = ["lv", "lt", "ee", "tw", "hk", "hk_en", "kz_ru", "za", "hu", "co", "cl"];
    for(let i = 2; i < args.length; i++){
        sitecode.push(args[i]);
    }
    console.log("Target Site:"+sitecode);
    return sitecode;
}

if(cluster.isMaster) {
    getSiteList().forEach(function(e) {        
        cluster.fork({'site': e, 'mode': 'Entire'});
    });

    cluster.on('online', function(worker) {
        //console.log('Worker ID : ' + worker.process.pid);
    });

    cluster.on('exit', (worker, code, signal) => {
        //console.log(`${worker.process.pid} Worker End`);
    });

} else {
    process.setMaxListeners(50);
    var task = require("../crawling/crawling_noEnti.js");
    task(cluster.worker.process.env.site, cluster.worker.process.env.mode);   
}


