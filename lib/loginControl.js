const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');
const eleControl = require('./elementControl.js');
const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'account.json')));
// const accounts = JSON.parse(fs.readFileSync('../config/account.json'));

async function loginAEM(page){
    var currentURL = page.url();
    var check = true;
    var ret = 0;
    console.log("[Connecting AEM]" + currentURL);
    
    do {
        try{
            if(currentURL.indexOf('login')!=-1) {                
                await page.type('#username',accounts.AEM_HSHOP.ID);
                await page.type('#password',accounts.AEM_HSHOP.PW);
                await page.click('#submit-button');
                await page.waitForTimeout(1000);
                currentURL = await page.url();                
                if(currentURL.indexOf('login')!=-1){
                    console.log('[Connect Success] ' + currentURL);
                    check = false;
                }                
                
            }
            else {
                console.log('[already loggined] ' +  currentURL);
                check = false;
            }
        }catch(e){
            ret++;
            console.log('[AEM Connect Retry] ' + currentURL); 
            await page.evaluate(async() => {
                location.reload(true);
                await (new Promise(rs => setTimeout(rs, 500)));  
            })
        }

    } while(check && ret < 3)

    if(ret == 3) {
        console.log('[AEM Connect Error] ' + currentURL);
        logger.error("AEM Connect Error: "  + currentURL);
    }
}

async function loginSMBUser(page, mode){

    const beforeURL = page.url();
    if(mode=="Guest" || mode=="Entire") return;
    let loginStatus;
    console.log("LoginSMBUser...");        
    await eleControl.closePOPUPs(page);
    await eleControl.closePOPUPs(page);    
     
    try{
        loginStatus = await page.$eval("[class='gnb__logout after-login-context']",el=>el.style.display,{timeout:3000});
    }catch(e){
        loginStatus = null;
    }
    
    if(loginStatus=="none"){                
        try{            
            await page.evaluate(()=>{
                window.scrollTo(0,0);
            });
            await page.click("[class='gnb__login-btn']");            

            try{
                await page.click("[class='gnb__login before-login-context'] [class='gnb__utility-menu']  [an-la='login']");
            }catch(e){
                logger.error("[SMB Login Fail : Not Applied] "+ page.url() + " :: " + e);
                console.log('SMB Login Fail : Not Applied'+page.url()+" "+mode); // logging 
                
            }            
            await page.waitForNavigation();         
            await page.waitForTimeout(10000);
                                    
            if(mode == "Include") {                  
                await page.type("[id='iptLgnPlnID']", accounts.SMB_JIRISAN.ID);                
                await page.click("[id='signInButton']");                
                await page.waitForTimeout(10000);
                await page.type("[id='iptLgnPlnPD']", accounts.SMB_JIRISAN.PW);                                
                await page.keyboard.press('Enter');
                await page.waitForTimeout(5000);
            } else if(mode == "Exclude") {
                await page.type("[id='iptLgnPlnID']", accounts.SMB_JIRISAN.ID);                
                await page.click("[id='signInButton']");
                await page.waitForTimeout(10000);               
                await page.type("[id='iptLgnPlnPD']", accounts.SMB_JIRISAN.PW);                                
                await page.keyboard.press('Enter');
                await page.waitForTimeout(5000);
            }


            try{
                await page.waitForSelector('#btnNotNow');
                await page.click('#btnNotNow');
                await page.waitForTimeout(3000);
            }catch(e){
                console.log("notnow X");
            }
                                    
            try{                
                await page.click("[id='terms']");    
                await page.waitForTimeout(2000);
                
            }catch(e){
                console.log("terms X");
            }   
                        
            await page.waitForTimeout(15000);
            try{                
                console.log("기존페이지 재진입..")
                await page.goto(beforeURL);
                await page.waitForTimeout(6000);
                console.log("성공")

            }catch(e){
                console.log("실패");
            }      
            console.log('SMB Login Success'+page.url()); // logging 
            
        }catch(e){
            logger.error("[SMB Login Fail] "+ page.url() + " :: " + e);
            console.log('SMB Login Fail'+page.url()+" "+mode); // logging 
        }
    }
    else if(loginStatus==''){
        console.log('SMB Login Skip'); // logging 
        
    }
    else{
        console.log("SMB Login Error");
        logger.error("SMB Login Error: "+page.url());
    }

}

module.exports.AEM = loginAEM;
module.exports.SMBUser = loginSMBUser;
