
const fs = require('fs');
const getDate  = require('../../../lib/getDate.js');
// const settings = JSON.parse(fs.readFileSync('D:\\SMB\\config\\settings.json'));
const settings = JSON.parse(fs.readFileSync('../../../config/settings.json'));
const puppeteer = require('puppeteer');
const login = require('../../../lib/loginControl.js');
const eleControl = require('../../../lib/elementControl.js');
const logger = require('../../../lib/logger.js');
const {siteTi, Tieredsave, searchAPIPath } = require('../../../config/config.js');


/*********************************************
    B2C Scenario Test 
    Tiered Price
    Process : S28_1303
    Writer  : DY
    Date    : 2022-09-13
**********************************************/
var args = process.argv;
//hk / hk_en 제외 
siteList = siteTi;

// main('cl');

Task();
async function Task() {
    for(const site of siteList) {
        await main(site);
    }
}

async function main(site){
    const browser = await launchBrowser();
    lists = await returnTieredList(site);    
    // 데이터 빠졋을대비 양식--------s
    // lists = [    
    //     {
    //         "SKU": "SM-A515FZWVEUB",
    //         "PDURL": "https://hshopfront.samsung.com/pt/business/smartphones/galaxy-a/galaxy-a51-a515-sm-a515fzwveub/buy/",
    //     }
    // ]
    // ----------------------
    let [pages] = await browser.pages();
    await pages.goto(settings.cookieURL);      

    let PFPage = await browser.newPage();    
    await PFPage.setExtraHTTPHeaders({ 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36/D2CEST-AUTO-70a4cf16'
    }); 
    await PFPage.goto("https://hshopfront.samsung.com/"+site+"/business/smartphones/all-smartphones/");        
    await login.AEM(PFPage);        
    await PFPage.waitForTimeout(3000);     
    await login.SMBUser(PFPage,"Include");    
    await eleControl.closePOPUPs(PFPage);
    await PFPage.waitForTimeout(3000); 

    let result = new Array();
    for(list of lists){
        
        productData = new Object();
        productData.SKU = list.SKU;  
        productData.PDURL = null;
        productData.Stock = null;
        productData.Include = null;
        productData.Exclude = null;
        productData.Comment = null;        

        console.log(list.PDURL);


        //2.
        productData.Include = await getTieredPrice("Include");
        productData.Exclude = await getTieredPrice("Exclude");        

        async function getTieredPrice(VAToption){
            
            console.log("VAToption: "+VAToption);              
            await eleControl.setVATExclude(PFPage,VAToption);

            const PDPage = await browser.newPage();
            await PDPage.waitForTimeout(500);
            
            
            if(list.PDURL!=PDPage.url()){                
                await PDPage.goto(list.PDURL);
                console.log(list.PDURL);             
                await login.AEM(PDPage);        
                await PDPage.waitForTimeout(5000);     
                await login.SMBUser(PDPage,"Include");  
                await eleControl.closePOPUPs(PDPage);      
            }            
            
                
            //1. KV가 없으면 CTA 클릭
            let KVArea = await PDPage.$("[class='pdd-buying-tool']");
            if(KVArea==null){                
                try{
                    let LNB_CTA = await PDPage.$("[class='pd-buying-price__cta'] > a");
                    await LNB_CTA.click();
                    await PDPage.waitForSelector("[class='pdd-buying-tool']");
                    await PDPage.waitForTimeout(2000);

                }catch(e){
                    productData.PDURL = PDPage.url();
                    console.log("다른 페이지");
                    await PDPage.close();
                    return "Other Page Type";
                }                                                
            }          
            
            
            productData.PDURL = PDPage.url();;      
            let BC_CTA = await PDPage.$("[class='pd-buying-price__cta'] > a");
            let BC_CTA_attr = await BC_CTA.evaluate(el=>el.getAttribute("an-ac"));
            productData.Stock = BC_CTA_attr;
            
            try{
                let tieredRows = (await PDPage.$$("[class='save-info__list'] >li")).length;
                tieredDataArray = new Array();        
                for(let tieredRowNum = 1 ; tieredRowNum<=tieredRows ; tieredRowNum++){
                    let tieredRow = await PDPage.$("[class='save-info__list'] >  li:nth-child("+tieredRowNum+")")
                    let tieredData = new Object();
                    tieredData.range ="";
                    tieredData.price = "";
                    tieredData.minCount = "";        
                    tieredData.minCartCount = "";
                    tieredData.minCartPrice = "";   
                    tieredData.maxCount = "";
                    tieredData.maxCartCount = "";
                    tieredData.maxCartPrice = "";
                    tieredData.comment="";
                    await PDPage.waitForTimeout(2000);      
                    let range = await tieredRow.$eval("[class='save-info__quantity-range']", el => el.innerText);            
                    range = range.replace(/(\r\n|\n|\r)/gm, "");
                    range = range.replace(/[^\w\-+/]+/g, "");
                    range = range.replace(/[a-z ]+/gi, "");            
                    tieredData.range = range;
        
                    
                    let split;
                    if(range.includes("+")){
                        split = range.split('+');
                        tieredData.minCount = split[0];
                        tieredData.maxCount = "N/A";
                    }
                    else{
                        split = range.split('-');
                        tieredData.minCount = split[0];
                        tieredData.maxCount = split[1];
                    }        
    
                    tieredData.price = await tieredRow.$eval("[class='save-info__total-price']", el => el.innerText);
                    
                    
                    //가격변경        
                    //1-2
                    //max
                    if(tieredData.maxCount!="N/A"){
                        //
                        let checkStock = await setStock(PDPage,tieredData.maxCount);
                        console.log("checkStock: "+checkStock)
                        console.log("count: "+tieredData.maxCount);
    
                        if(checkStock==tieredData.maxCount){
                            await PDPage.waitForTimeout(2000);
                            console.log("maxCountGotoCart")
                            if(productData.Stock!="stock alert") tieredData = await gotoCart(PDPage,tieredData,productData.SKU,"max");                            
                        }
                        else{
                            //수량 불일치    
                            await PDPage.reload();
                            await PDPage.waitForSelector("[class='pdd-buying-tool']");
                            await PDPage.waitForTimeout(5000);
                            tieredData.comment = "max: lowStock:" +checkStock+" ";
                        }
                        
                    }
                         
                    //min
                    let checkStock = await setStock(PDPage,tieredData.minCount);    
                    console.log("checkStock: "+checkStock);
                    console.log("count: "+tieredData.minCount);
                    if(checkStock==tieredData.minCount){                
                        if(productData.Stock!="stock alert") tieredData = await gotoCart(PDPage,tieredData,productData.SKU,"min");                        
                    }
                    else if(tieredData.minCount=="1"){
                        console.log("min이 1일때 .. 1개 케이스");
                        if(productData.Stock!="stock alert") tieredData = await gotoCart(PDPage,tieredData,productData.SKU,"min");                                        
                    }
                    else{
                        //수량 불일치    
                        await PDPage.reload();
                        await PDPage.waitForSelector("[class='pdd-buying-tool']");
                        await PDPage.waitForTimeout(2000);
                        tieredData.comment = "min: lowStock:" +checkStock+" ";
                    }
        
                    tieredDataArray.push(tieredData);
                }
                await PDPage.close();
                return tieredDataArray;
            }catch{
                
            }
        }        

        result.push(productData);
        console.log(productData);
    }    

    console.log("테스트 끝///"+getDate.getCurrentTime());
    await browser.close();
    const output = JSON.stringify(result, null, 2);
    fs.writeFileSync(Tieredsave + site +'_tieredData.json',output);
    console.log(site + " tiered Saved");

}

async function launchBrowser(){
    const browser = await puppeteer.launch({ 
        //headless: false, 
        args: ['--start-maximized'],
        defaultViewport: {width: 1920, height:1080}
    });
    return browser;
}


/** SetStock and return realcurrentStock */
async function setStock(page,count){
    let currentStockCount = await page.evaluate((count)=>{
        try{
            for(let i=1 ; i<count; i++){
                document.querySelector("[class='quantity-counter__increase button-up-down']").click();                
            }
            return document.querySelector("[id='counterText']").value;
        }catch(e){
            return "Error"
        }
    

    },count);
    return currentStockCount;
}     


//* tieredPrice ver
async function gotoCart(page,productData,SKU,minmax){
    let BCPageURL = page.url();

    await page.waitForTimeout(2000);       
    
    console.log("click lnb cta");                     
    try{
        await page.evaluate(()=>{
            document.querySelector("[class='pd-buying-price__cta'] > a").click();
        })
    }catch(e){
        console.log("NO");
    }    
    await page.waitForTimeout(1000);

    try{
        await page.evaluate(()=>{
            document.querySelector("[class='product-bought-together__summary-cta'] > a").click();
        })
    }catch(e){
        console.log("CONTINUE X");
    }

    await page.waitForTimeout(10000); //이부분 민감하게 
    await eleControl.closePOPUPs(page);  

    if(await page.url().includes("cart")){
        console.log("CART 진입");                                
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
                if(cartPriceValue!=null) productData[minmax+"CartPrice"] = cartPriceValue;   
                console.log('CARTPRICE: '+cartPriceValue);
            }catch(e){
                
            }        
        }

        //xpath로 한번더 시도
        if(productData[minmax+"CartPrice"]==''){
            try{
                productData[minmax+"CartPrice"] = await page.evaluate(async(SKU)=>{
                    return document.evaluate(".//span[@data-variant-sku='"+SKU+"']/../../..//div[@class='item-price']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText;
                },SKU)
            }catch(e){
                productData[minmax+"CartPrice"] = "PRICE ERROR";
            }            
        }

        //카트 수량 얼마나
        try{
            productData[minmax+"CartCount"] = await page.evaluate(async(SKU)=>{
                return document.evaluate(".//span[@data-variant-sku='"+SKU+"']/../../../../div[@class='cart-top-actions']//input[@name='quantity']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.value;
            },SKU)
        }catch(e){
            productData[minmax+"CartCount"] = "";
        }            
        

        const cartRemoveselectors = [
            "[data-modelcode='"+SKU+"'] [class*='cart-top-actions'] [class*='desk'] > button",
            "[class='cart-top-actions'] [class~='visible-inline-desktop'] button[data-variant-sku='"+SKU+"']"
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
        productData["comment"] += minmax+": CANNOT GO TO CART ";
        console.log("????");

    }     
    
    await page.goto(BCPageURL);
    await page.waitForTimeout(3000);
    try{
        await page.waitForSelector("[class='pdd-buying-tool']");    
        await page.waitForTimeout(3000);
    }catch(e){

    }

    return productData;                               
}




async function returnTieredList(site){    
    console.log(site+"//"+getDate.getCurrentDate());  
    let arr = new Array();
    const Search_API = JSON.parse(fs.readFileSync(searchAPIPath + "Search_API_" + site + '.json'));            
    for(i = 0 ; i < Search_API.length ; i++){   
        try{
            if(Search_API[i].tieredPriceDisplay !=""){
            //if(Search_API[i].tieredPrice.TieredPrices_value!=""){
                let obj = new Object();
                obj.SKU = Search_API[i].modelCode;
                obj.PDURL = settings.TargetServer.live+Search_API[i].pdpUrl;
                arr.push(obj);                
            }
        }catch(e){

        }
                 
    } 
    console.log("Target Length: "+arr.length);    
    return arr;    
        
}


