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


