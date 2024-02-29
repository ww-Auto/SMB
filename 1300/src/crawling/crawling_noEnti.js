/*********************************************
    B2C Scenario Test 
    PF - PD - Cart Normal Jouney
    Process : S28_1302
    Writer  : DY
    Date    : 2022-05-23
**********************************************/

const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const login = require('../../../lib/loginControl.js');
const eleControl = require('../../../lib/elementControl.js');
const settings = JSON.parse(fs.readFileSync('../../../config/settings.json'));
const logger = require('../../../lib/logger.js');
const getDate  = require('../../../lib/getDate.js');
const { searchAPIPath } = require('../../../config/config.js');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer'); 
puppeteer.use(StealthPlugin()); 

function task(site, mode) {    
    main(site, mode).then((data) => {
        const result = JSON.stringify(data, null, 2);
        let slicedFileName = '';
        if(settings.slicing.value==true){
            slicedFileName = "_"+settings.slicing.option;
        }
        fs.writeFileSync('../../../outputs/' + site + '_' + mode + slicedFileName +'_PD.json',result);
        console.log(site + " " + mode + " PD Output Save!");
        process.send({ type : "end", 'mode' : mode, 'pid': process.pid, 'site': site});
        process.exit(0);
    });

}

async function main(site,mode){     
    const startTime = getDate.getCurrentTime();
    let setheadless = false;
    // if(mode=="Entire") setheadless = true;
    return new Promise (async(rs, rj) => {
        puppeteer.get
        const browser = await puppeteer.launch({ 
            headless: setheadless, 
            executablePath: executablePath(), // "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            args: ['--start-maximized', '--incognito'],
            //ignoreDefaultArgs: ['--enable-automation'],
            defaultViewport: {width: 1920, height:1080}
        });

        //let [pages] = await browser.pages();
        //await pages.goto(settings.cookieURL);   

        let testTarget = readSearchAPI(site,mode);         

        var now = 1;
        var total = testTarget.length;
                
        const [PF_PAGE] = await browser.pages();
        await PF_PAGE.setExtraHTTPHeaders({ 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36/D2CEST-AUTO-70a4cf16'
        }); 
        let currentPFURL;
        //window.testlog
        await PF_PAGE.exposeFunction('testlog', async (msg) => {
            console.log(msg);
        });   

        //API에서 가져온 데이터가 끝날떄까지 돌리기
        let result =new Array();
        console.log("Start: "+startTime);
        if(mode=="Include") {
            await PF_PAGE.waitForTimeout(2000);
            console.log("Include 시간 주기")
        }
        if(mode=="Exclude") {
            await PF_PAGE.waitForTimeout(6000);
            console.log("Exclude 시간 주기")
        }
        while(testTarget.length!=0){ 
            const SKU = testTarget[0].modelCode;
            process.send( { 'site': site, 'mode': mode, 'url': testTarget[0].PFURL, 'now': now, 'total': total})

            let productData = new Object();

            //INIT

            //PF
            productData.PF_URL ="";
            productData.SKU = SKU;
            productData.PF_NUM = "";
            productData.PF_DISPLAYNAME = "";
            productData.PF_COLOR = "";
            productData.PF_MEMORY = "";
            productData.PF_PRICE_PROMOTION = "";
            productData.PF_PRICE_SAVE = "";
            productData.PF_PRICE_ORIGINAL = "";
            productData.PF_TIERED_MIN = "";
            productData.PF_TIERED_PRICE = "";
                                   
            //PD            

            //BUYNOW
            productData.BUY_NOW_CTA_URL = "";
            productData.BUY_NOW_CTA_STOCK ="";
            productData.BUY_NOW_PD_TYPE ="";
        
            productData.BUY_NOW_FEATURE_Promotion_Price ="";
            productData.BUY_NOW_FEATURE_Original_Price ="";
            productData.BUY_NOW_FEATURE_Save_Price ="";
            productData.BUY_NOW_BC_Promotion_Price ="";
            productData.BUY_NOW_BC_Original_Price ="";
            productData.BUY_NOW_BC_Save_Price ="";

            //LEARNMORE
            productData.LEARN_MORE_CTA_URL = "";
            productData.LEARN_MORE_CTA_STOCK ="";
            productData.LEARN_MORE_PD_TYPE ="";
            productData.LEARN_MORE_FEATURE_Promotion_Price ="";
            productData.LEARN_MORE_FEATURE_Original_Price ="";
            productData.LEARN_MORE_FEATURE_Save_Price ="";

            productData.LEARN_MORE_BC_Promotion_Price ="";
            productData.LEARN_MORE_BC_Original_Price ="";
            productData.LEARN_MORE_BC_Save_Price ="";

            //COMMON
            productData.PD_Tiered_Min = "";
            productData.PD_Tiered_Price = "";

            productData.Cart_Price ="";
            productData.Cart_Quantity ="";
            productData.Cart_URL ="";
            productData.Comment = "";

            console.log(testTarget[0]);
            if(testTarget[0].PFURL!=PF_PAGE.url()) {
                await PF_PAGE.goto(testTarget[0].PFURL);                              
                await login.AEM(PF_PAGE);                
                currentPFURL = PF_PAGE.url();
                await PF_PAGE.waitForTimeout(4000);
            }               
            
            if(!(await eleControl.check404page(PF_PAGE))){                
                productData.PF_URL = PF_PAGE.url();
                productData.Comment = "PF_404";
                testTarget.shift();
                continue;
            }

            await eleControl.closePOPUPs(PF_PAGE);
            console.log("mode: "+mode);
            await login.SMBUser(PF_PAGE, mode);      // 수동 전환
            
            let CTALinks = await findCTAlink(PF_PAGE,testTarget[0].familyRecord,testTarget[0].modelCode,testTarget[0].fmyChipList,testTarget[0].fmyChipList2);              
            productData.PF_URL = PF_PAGE.url();

            if(CTALinks.length == 0 || CTALinks=="ONLY_API"){
                console.log("ERROR");
                logger.error("OnlyAPI SKU: "+SKU+": PF_URL: " +PF_PAGE.url());
                productData.Comment = "OnlyAPI";
                result.push(productData);                               
                testTarget.shift(); 
                continue;
            }
            else if(CTALinks=="EMPTY_PF"){
                logger.error(SKU+": EMPTY_PF: " +PF_PAGE.url());
                productData.Comment = "EMPTY_PF";
                result.push(productData);                               
                testTarget.shift(); 
                continue;
            }
            else {                      
                const VATButton_Style = 
                await PF_PAGE.evaluate(() => {
                     return document.querySelector("[class='pd12-product-finder__filters-bar-vat js-pd12-vat-switch-area']").style.display;                      
                });
                            
                if(VATButton_Style=="none" && mode=="Guest"){                                                                                                                                                                                                               
                    //정상 결과임                    
                    
                }
                else if(VATButton_Style=="none" && mode!="Guest" && mode!="Entire"){                                        
                    //게스트가 아닌데 VAT옵션이 없음
                    logger.error(PF_PAGE.url() + "HAS NO VAT OPTION");
                    productData.Comment = "VATOption is not Applied";
                    result.push(productData);                       
                    testTarget.shift(); 
                    continue;
                }
                else{
                    //정상결과임(Login)
                    await eleControl.setVATExclude(PF_PAGE,mode);                                            
                }                
                
                let familyRecord = (testTarget[0].familyRecord-1); 
                productData.PF_NUM = familyRecord+1;
                productData = await PF_PAGE.evaluate(async(productData,familyRecord)=>{                                            
                    try{
                        productData.PF_DISPLAYNAME = await document.querySelector("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__name-text']").innerText;                
                    }catch(e){}
                    try{
                        productData.PF_COLOR = await document.querySelector("[data-productidx='"+familyRecord+"'] [class='option-selector-v2__swiper-slide is-checked'] [class='option-selector-v2__color-code']").innerText;                        
                    }catch(e){}
                    try{
                        productData.PF_MEMORY = await document.querySelector("[data-productidx='"+familyRecord+"'] [class='option-selector-v2__swiper-slide is-checked'] [class='option-selector-v2__size-text']").innerText;                
                    }catch(e){}
                    try{
                        productData.PF_PRICE_PROMOTION = await document.querySelector("[data-productidx='"+familyRecord+"'] [class*='pd12-product-card__price-full js']").getAttribute("data-pricetext");
                    }catch(e){}
                    try{
                        productData.PF_PRICE_ORIGINAL = await document.querySelector("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__price-suggested'] > del").innerText;
                    }catch(e){}
                    try{
                        productData.PF_PRICE_SAVE = await document.querySelector("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__price-save js-tax-price']").innerText;
                    }catch(e){}      

                    try{
                        await document.querySelector("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__sign-in js-tiered-layer-open']").click();                            
                        await (new Promise(rs => setTimeout(rs, 4000)));            
                        const tieredPopup = await document.querySelectorAll("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__save-info-item']");
                        let PF_Tiered_Min = "";
                        let PF_Tiered_Price = "";                        
                        for(let tiered of tieredPopup){                
                            PF_Tiered_Min += await tiered.querySelector("[class='pd12-product-card__save-range']").innerText+"/";
                            PF_Tiered_Price+= await tiered.querySelector("[class*='pd12-product-card__save-price-full']").innerText+"/";
                        }                        
                        productData.PF_TIERED_MIN = PF_Tiered_Min;
                        productData.PF_TIERED_PRICE = PF_Tiered_Price;
                    
                        await document.querySelector("[data-productidx='"+familyRecord+"'] [class='pd12-product-card__tiered-pricing-close']").click();   

                    }catch(e){
                        //티어없음
                    }

                    return productData;
                },productData,familyRecord);

                console.log(productData);
                                
                //CTA 전부 찾음
                for(let CTALink of CTALinks){

                    console.log("SKU: " + SKU);
                    console.log((CTALinks.indexOf(CTALink)+1)+"번째 CTA"); //디버그 용도     
                    console.log("CTATYPE: "+CTALink.TYPE);
                    console.log("CONVERT: "+isLearnmoreCTA(CTALink.TYPE));
                    console.log(isLearnmoreCTA(CTALink.TYPE)); //디버그 용도

                    //순서에 관계없이 체크
                    
                    //링크가 있을경우
                    if(CTALink.LINK!=null && CTALink.LINK!="javascript:;"){                        
                        
                        const PDP = await browser.newPage();
                        await PDP.setExtraHTTPHeaders({ 
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36/D2CEST-AUTO-70a4cf16'
                        }); 
                        const PDPURL = settings.TargetServer.live+CTALink.LINK;
                        try{
                            await PDP.goto(PDPURL);      
                        }catch(e){

                        }
                        

                        if(PDP.url().includes("/samsung/login/")){
                            await login.AEM(PDP);
                            await login.SMBUser(PDP,mode);
                        }
                        await eleControl.closePOPUPs(PDP);
                        //실제 페이지 타입에 따른 컨트롤
                        const PDTYPE = await getPDType(PDP,testTarget[0].sitecode);                       

                        productData[isLearnmoreCTA(CTALink.TYPE)+"_CTA_STOCK"] = convertStock(CTALink.TYPE);
                        productData[isLearnmoreCTA(CTALink.TYPE)+"_PD_TYPE"] = PDTYPE;                    
                        productData[isLearnmoreCTA(CTALink.TYPE)+"_CTA_URL"] = PDP.url(); 
                        console.log("start");
                        console.log(productData);
                        productData = await getPDData(PDP,PDTYPE,productData,isLearnmoreCTA(CTALink.TYPE),SKU,isIMProduct(testTarget[0].pviTypeName),mode);                      
                        console.log("end");
                        console.log(productData);

                        await PDP.close();                                                  
                    
                    }else{
                        //링크가 없을경우에 기록
                        productData[isLearnmoreCTA(CTALink.TYPE)+"_CTA_STOCK"] = convertStock(CTALink.TYPE);                    
                        if(CTALink.LINK==null)productData[isLearnmoreCTA(CTALink.TYPE)+"_CTA_URL"] = null; 
                        else if(CTALink.LINK=="javascript:;")productData[isLearnmoreCTA(CTALink.TYPE)+"_CTA_URL"] = "javascript:;";                         
                    }
                            
                }
                result.push(productData);   
                // console.log(productData);
            }

            now++;                            
            testTarget.shift();   
            console.log("Remaining Product: " +testTarget.length);
            
        }
        rs(result);
        
        await browser.close();  

    });

    
         
}

async function getPDData(page,PDTYPE,productData,CTAHandler,SKU,isIMProduct,mode){
    
    if(CTAHandler=="BUY_NOW" && mode=="Entire") return productData; //Entire모드일땐 Learnmore만 타고가도록 스킵
        
    if(PDTYPE=="FEATURE"){
        await page.waitForTimeout(2000);
        await getLNBPrice(CTAHandler,PDTYPE);        
        await clickLNBCTA(PDTYPE);
        await page.waitForTimeout(2000);
        if(mode!="Guest"&& mode!="Entire") await getTieredPrice();
        await getLNBPrice(CTAHandler,"STANDARD");        
        if(productData["Cart_Price"]=="" && mode!="Entire"){
            await clickLNBCTA("STANDARD");
            await gotoCart(page,productData);
        }
    }
    else if(PDTYPE=="STANDARD"){
        await page.waitForTimeout(2000);
        await getLNBPrice(CTAHandler,PDTYPE);
        if(mode!="Guest"&& mode!="Entire") await getTieredPrice();
        if(productData["Cart_Price"]=="" && mode!="Entire"){
            await clickLNBCTA("STANDARD");
            await gotoCart(page,productData);
        }
        
    }        

    /** */
    async function getLNBPrice(CTAHandler,PDTYPE){    
        console.log("getLNBPrice()")    
        await page.waitForTimeout(2000);

        let PD_Handler;
        if(PDTYPE=="FEATURE") PD_Handler="_FEATURE";
        else if(PDTYPE=="STANDARD") PD_Handler="_BC";

        console.log(CTAHandler+"//"+PD_Handler);        
        
        try{                    
            const Promotion_Price = await page.waitForSelector("[class='pd-buying-price__new-price']",{timeout:1000});
            const Promotion_Price_Value = await Promotion_Price.evaluate(el => el.textContent);            
            productData[CTAHandler+PD_Handler+"_Promotion_Price"] = Promotion_Price_Value;                                    
        }catch(e){
            productData[CTAHandler+PD_Handler+"_Promotion_Price"] = "";                                    

        }

        try{
            const Original_Price = await page.waitForSelector("[class='pd-buying-price__was'] > del",{timeout:1000});
            const Original_Price_Value = await Original_Price.evaluate(el => el.textContent);                         
            productData[CTAHandler+PD_Handler+"_Original_Price"] = Original_Price_Value;                                                     
        }catch(e){
            productData[CTAHandler+PD_Handler+"_Original_Price"] = "";                                                     
        }
        
        try{
            const Save_Price = await page.waitForSelector("[class='pd-buying-price__save']",{timeout:1000});
            const Save_Price_Value = await Save_Price.evaluate(el => el.textContent);     
            productData[CTAHandler+PD_Handler+"_Save_Price"] = Save_Price_Value;                                                     
        }catch(e){
            productData[CTAHandler+PD_Handler+"_Save_Price"] = "";  
        }        
        console.log(productData)

    }
    

    async function getTieredPrice(){
        //티어프라이스 관련내용         
        let tieredPrice;
        try{
            tieredPrice = await page.waitForSelector("[class='save-info__item result-price']",{timeout:3000});
        }catch(e){
            tieredPrice = null;
        }
        if(tieredPrice!=null){
            console.log("getTieredPrice()");
            var tieredprices = await page.evaluate(()=>{                    
                var arr = new Array();
                var rows = document.querySelectorAll("[class='save-info__item result-price']");
                let quantityResult='';
                let priceResult='';
                for(let row of rows){    
                    var quantity = row.querySelector("[class='save-info__quantity-range']").innerText;    
                    var quantity_hidden = document.querySelector("[class='save-info__quantity-range'] [class='hidden']").innerText;
                    quantity = quantity.replace(/\n/g, "");
                    var quantemp = quantity.replace(quantity_hidden,'');
                    quantityResult+=quantemp+"/";
                    var price = row.querySelector("[class='save-info__total-price']").innerText;    
                    var pricehidden = document.querySelector("[class='save-info__total-price'] [class='hidden']").innerText;
                    price = price.replace(/\n/g, "");
                    var pricetemp = price.replace(pricehidden,'');
                    priceResult+=pricetemp+"/";                        
                }                    
                arr.push(quantityResult);
                arr.push(priceResult);  
                return arr;
            })
            if(tieredprices[0]!='' && tieredprices[1]!=''){
                productData.PD_Tiered_Min = tieredprices[0];
                productData.PD_Tiered_Price = tieredprices[1];
            }
            
            console.log(productData)
        }
        else{
            console.log("티어프라이스 없음");
        }
        
    }
    
    async function clickLNBCTA(PDTYPE){
        await page.waitForTimeout(5000); //여기 딜레이 조정
        let LNB_CTA = await page.$("[class='pd-buying-price__cta'] > a");
        let LNB_CTA_attr = await LNB_CTA.evaluate(el=>el.getAttribute("an-la"));
        console.log("lnbctaattr: "+LNB_CTA_attr);
        
        //클릭하기전 attr 체크
        if(LNB_CTA_attr!=null){   
            if(LNB_CTA_attr.includes("stock alert")) {
                productData.Cart_Price = "Get Stock Alert";
                console.log("getstockalert")
            }
            else if(LNB_CTA_attr.includes("contact")) {
                productData.Cart_Price = "Contact Us";
                console.log("contactus")
            }
            else{                
                console.log("else");
                try{    
                    await eleControl.closePOPUPs(page);                
                    await LNB_CTA.click();                                   
                    await page.waitForTimeout(3000); //여기 딜레이 조정
                    
                    if(await eleControl.checkPDErrorPopup(page)){                        
                        productData.Comment = "PD Error Popup";
                    }                                        
                    
                    else{
                        try{
                            if(PDTYPE=="FEATURE") await page.waitForSelector("[class='pdd-buying-tool__info']");                    
                        }catch(e){}    

                    }     
                
                                                                           
                }catch(e){console.log(e)}
                
            }                

        }
        console.log("clicklnb")
        console.log(productData)
    }    

    return productData;
}


async function gotoCart(page,productData){   
    console.log("gotocart()");
    console.log(productData);
    if(await eleControl.checkSMBregisterPopup(page)){
        console.log("guest")
        productData.Cart_Price="Guest_Popup";
    }
    //CONTINUE 체크함 
    const selectors = [
        "[class='product-bought-together__summary-cta'] > a",
        "[class='cta cta--contained cta--emphasis']"
    ];

    for(const selector of selectors) {
        try {
            await page.click(selector, {timeout:1000});

            await page.waitForTimeout(500);
        } catch(e) {
            console.log("CONTIUE X");
        }
    }    

    if(productData.Cart_Price!='') return;

    const SKU = productData.SKU;        
    try{
        await page.waitForSelector("[class='cart-item-top']",{timeout:40000});
        await page.waitForTimeout(3000);
    }catch(e){
        console.log(e);
    }
    
    await eleControl.closePOPUPs(page);  
    if(await page.url().includes("cart")){
        console.log("CART 진입");   
        productData.Cart_URL = page.url();                             
        await eleControl.closePOPUPs(page);
        //카트 url 기록 logger;
        console.log("SKU:" +SKU);                
        const cartPriceselectors = [
            "[data-modelcode='"+SKU+"'] [class='item-price']"
        ];         
        //get CARTPRICE       
        for(const cartPriceselector of cartPriceselectors){
            try{
                const cartPriceValue = await page.$eval(cartPriceselector, el => el.innerText);
                if(cartPriceValue!=null) productData["Cart_Price"] = cartPriceValue;   

                console.log('CARTPRICE: '+cartPriceValue);
            }catch(e){
                
            }        
        }

        //xpath로 한번더 시도
        if(productData.Cart_Price==''){
            try{
                productData.Cart_Price = await page.evaluate(async(SKU)=>{
                    return document.evaluate(".//span[@data-variant-sku='"+SKU+"']/../../..//div[@class='item-price']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText;
                },SKU)
            }catch(e){
                try{
                    return document.evaluate(".//button[@data-variant-sku='"+SKU+"']/../../div[@class='cart-item-top']//div[@class='item-price']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText;
                }catch(e){
                    productData.Cart_Price ="PRICE ERROR";
                }
                
            }            
        }

        //카트 수량 얼마나
        try{
            productData.Cart_Quantity = await page.evaluate(async(SKU)=>{
                return document.evaluate(".//span[@data-variant-sku='"+SKU+"']/../../../../div[@class='cart-top-actions']//input[@name='quantity']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value;
            },SKU)
        }catch(e){            
            productData.Cart_Quantity = "?";
        }                 
        if(productData.Cart_Quantity=="?"){
            try{
                productData.Cart_Quantity = await page.evaluate(async(SKU)=>{
                    return document.querySelector("[data-modelcode='"+SKU+"'] [name='quantity']").value;
                },SKU)
            }catch(e){
                productData.Cart_Quantity = "??";
            }
        }        

        const cartRemoveselectors = [
            "[data-modelcode='"+SKU+"'] [class*='cart-top-actions'] [class*='desk'] > button",
            "[class='cart-top-actions'] [class~='visible-inline-desktop'] button[data-variant-sku='"+SKU+"']",
            "[data-modelcode='"+SKU+"'] button[data-remove-entry='removeEntry_0']",
            "[class='btn btn-default btn-block js-remove-entry']"
        ];

        for(const cartRemoveselector of cartRemoveselectors){
            try{    
                await page.click(cartRemoveselector);
                await page.waitForTimeout(2000);
                console.log("Cart deleted");                         
                
            }catch(e){
                console.log(cartRemoveselector+" X");
            }        
        }
                                        
    }
    else{
        productData.Cart_Price= "PAGE ERROR";
    }     

    return productData;
    
}



 
async function findCTAlink(page,cardnum,sku,chip1,chip2){   

    try{
        let CTAINFO = new Array();
        if(await eleControl.waitingforCard(page)){
            await eleControl.closePOPUPs(page);        
            await eleControl.clickViewmore(page);
                
            console.log("------------")
            console.log("CARDNUM:"+cardnum);
            console.log("SKU:"+sku);            
            console.log(chip1+"/"+chip2);
                                        


            await page.evaluate(async(cardnum,chip1,chip2)=>{                                    
                const card = document.querySelector("[data-productidx='"+(cardnum-1)+"']");
                if(chip1!=null ||chip1!="") {                       
                    const chip_one = card.querySelector("[class='pd12-product-card__option-selector'] [an-la*='"+chip1+"']");
                    if(chip_one!=null) await chip_one.click();                
                }
                await (new Promise(rs => setTimeout(rs, 1000)));
                if(chip2!=null || chip2!="") {
                    const chip_two = card.querySelector("[class='pd12-product-card__option-selector'] [an-la*='"+chip2+"']");
                    if(chip_two!=null) await chip_two.click();                            
                }              
                await (new Promise(rs => setTimeout(rs, 1000)));
            },cardnum,chip1,chip2);
                        
            await (new Promise(rs => setTimeout(rs, 1000)));

            CTAINFO = await page.evaluate((cardnum,sku) =>{            
                const CTAs = document.querySelectorAll("[data-productidx ='"+(cardnum-1)+"'] [class='pd12-product-card__cta'] *");            
                let arr = new Array();
                
                for(CTA of CTAs){                   
                    if(CTA.getAttribute('data-modelcode')==sku){
                        let obj = new Object();
                        obj.TYPE = CTA.getAttribute("an-la");
                        obj.LINK = CTA.getAttribute("href");
                        arr.push(obj);                                     
                    }                       
                }
                return arr;
            },cardnum,sku);
            
            console.log(CTAINFO);        
            return CTAINFO;
        }
        else{        
            console.log("PF CARD 비어있음");
            return "EMPTY_PF";
        }

    }catch(e){        
        return "ONLY_API";
    }
    
}




async function getPDType(page,sitecode){

    let pdNAVbar = null;     
    try{
        pdNAVbar = await page.waitForSelector("[class='pd11-anchor-nav bg-black']",{timeout:5000});
    }catch(e){
        console.log('pdnavbar X');
    }

    let buyConfigurator = null;
    try{        
        buyConfigurator = await page.waitForSelector("[class~='bu-pd-g-product-detail-kv']",{timeout:5000});
    }catch(e){
        console.log('buyConfigurator X');
    }
    
    if(pdNAVbar!=null & buyConfigurator!=null){
        return "STANDARD";
    }
    else if(pdNAVbar!= null & buyConfigurator==null){
        return "FEATURE";
    }
    else{

        //PCD
        var PCDList = [
            settings.TargetServer.live+"/"+sitecode+"/business/smartphones/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/business/smartphones/",
            settings.TargetServer.live+"/"+sitecode+"/smartphones/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/smartphones/"
        ]
        for(PCD of PCDList){
            if(page.url()==PCD) return "PCD";
        }        
        //PF?


        //MKT 
        try{
            let mktBar = await page.waitForSelector("[class='floating-navigation__button-wrap']",{timeout:2000});
            console.log('MKT');
            return "MKT";
        }catch(e){
            console.log('MKT X');
        }   
        
        //MKT 
        var MKTList = [
            settings.TargetServer.live+"/"+sitecode+"/business/smartphones/galaxy-note10/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/business/smartphones/galaxy-note10/",
            settings.TargetServer.live+"/"+sitecode+"/business/smartphones/galaxy-s10/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/business/smartphones/galaxy-s10/",
            settings.TargetServer.live+"/"+sitecode+"/smartphones/galaxy-note10/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/smartphones/galaxy-note10/",
            settings.TargetServer.live+"/"+sitecode+"/smartphones/galaxy-s10/",
            settings.TargetServer.hshopfront+"/"+sitecode+"/smartphones/galaxy-s10/"
        ]
        for(MKT of MKTList){
            if(page.url()==MKT) return "MKT";
        }        
        //PF?
        
        if((await eleControl.check404page(page))==false){
            console.log('404');
            return "404";
        }    
                
        
        //OTHER
        return "OTHER";
    }

}

function isIMProduct(pviTypeName){
    if(pviTypeName != null && pviTypeName.includes("Mobile")) return true;
    else return false;
}

function isLearnmoreCTA(CTAType){
    if(CTAType.includes("learn")) return "LEARN_MORE";
    else return "BUY_NOW";
}

function convertStock(stock){   
    if(stock!=null){
        console.log("CONVERTSTOCK: " + stock);
        if(stock.includes("buy now")) return "inStock";    
        else if(stock.includes("pre order")) return "preOrder";    
        else if(stock.includes("stock alert")) return "outOfStock";    
        else if(stock.includes("learn more")) return "learnMore";  
        else return stock;  
    }     
    return stock;  
}

function readSearchAPI(site,mode){    
    var testTarget = new Array();
                                
    //const searchAPI = JSON.parse(fs.readFileSync("D:\\Project\\Node\\S28_1200\\S28_1200\\result\\Search_API_Result\\Search_API_"+site+'.json'));      
    //const searchAPI = JSON.parse(fs.readFileSync("Y:/smb/2024smb/sit/data/"+getDate.getCurrentDate()+"/Search_API_Result/Search_API_"+site+'.json'));      
    const searchAPI = JSON.parse(fs.readFileSync(searchAPIPath + "Search_API_"+site+'.json'));      

    console.log(getDate.getCurrentDate());  
    for(i = 0 ; i < searchAPI.length ; i++){            
        let obj = new Object();

        if(searchAPI[i].promotionPriceDisplay!="" || mode==="Entire") {   
        
            const familyRecord = searchAPI[i].familyRecord;                
            const sitecode = searchAPI[i].sitecode;                
            const APICode = searchAPI[i].APIType;                
            const modelCode = searchAPI[i].modelCode;
            const pviTypeName = searchAPI[i].pviTypeName;
            const fmyChipList = searchAPI[i].fmyChipOptionName1;                
            const fmyChipList2 = searchAPI[i].fmyChipOptionName2;
                            
            let PFURL = getPFURL(settings.TargetServer.hshopfront+"/",sitecode,APICode);
            
            obj.sitecode = sitecode;
            obj.familyRecord = familyRecord;                
            obj.modelCode = modelCode;
            obj.pviTypeName = pviTypeName;
            obj.fmyChipList = fmyChipList;
            obj.fmyChipList2 = fmyChipList2;
            obj.PFURL = PFURL;                
            testTarget.push(obj);                
        }
    }
   
    // console.log(testTarget);    
        
    
    function getPFURL(stage,sitecode,apiCode){
        const apicodeList = JSON.parse(fs.readFileSync('../../../config/apicode.json'));                     
        return stage+sitecode+"/business"+apicodeList[apiCode].url;    
    }
    
    let len = Math.floor((testTarget.length/2));    
    if(settings.slicing.value==true){        
        if(settings.slicing.option){
            console.log("pop");
            for(let i=0; i<len; i++) testTarget.pop();                
        }        
        else{
            console.log("shift");
            if(!(Number.isInteger((testTarget.length/2)))) len+=1;
            for(let i=0; i<len; i++) testTarget.shift();        
        }     
    }
           
    return testTarget;
    
}

module.exports = task;

