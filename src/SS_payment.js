const puppeteer = require('puppeteer');
const eleControl = require('../lib/elementControl.js');
/**shop테스트용으로만듬  */

main();

async function main(){

    const browser = await puppeteer.launch({headless : false, args: ['--start-maximized']});
    const page = (await browser.pages())[0];
    await page.goto('https://stg2.shop.samsung.com/getcookie.html');
    var c = await page.cookies();

   await page.setViewport({
        width: 1920,
        height: 1080
    });
    
    await page.setCookie(...c);
    await page.goto('https://p6-pre-qa2.samsung.com/aemapi/v6/storedomain/setdata?siteCode=uk');                   
    await page.type('#username',"qauser01");
    await page.type('#password',"samsungqa");
    await page.click('#submit-button');
    await page.waitForTimeout(1000);                    
    await page.goto('https://p6-pre-qa2.samsung.com/aemapi/v6/storedomain/setdata?siteCode=uk&storeDomain=https://stg2.shop.samsung.com&storeWebDomain=https://stg2-eu2-api.ecom-xtg.samsung.com&cart=https://stg2.shop.samsung.com/uk/cart');
    await page.goto("https://p6-pre-qa2.samsung.com/uk/smartphones/galaxy-s22-ultra/buy/");
    
    
    //PDP
    await page.waitForSelector("[class='hubble-product__total'] [class='s-hubble-total-cta'] > a");
    await eleControl.closePOPUPs(page);   
    await page.waitForTimeout(2000); 
    await page.evaluate(() => { document.querySelector("[class='hubble-product__total'] [class='s-hubble-total-cta'] > a").click(); });    
    await page.waitForTimeout(7000); 
    
    await page.waitForSelector("[class='cta cta--contained cta--emphasis addon-continue-btn']",{timeout:5000});    
    await eleControl.closePOPUPs(page);        
    await page.evaluate(() => { document.querySelector("[class='cta cta--contained cta--emphasis addon-continue-btn']").click(); });    
    //GIFT SKIP(OPTION)

    try{
        console.log("GIFT2");
        await page.waitForSelector("[class='cta cta--contained cta--emphasis']",{timeout:5000});
        await page.evaluate(() => { document.querySelector("[class='cta cta--contained cta--emphasis']").click(); });    
    }catch(e){
        console.log("gift2 X")
    }
    try{
        console.log("GIFT3");
        await page.waitForSelector("[data-an-la='bundle offer:free gift:skip']",{timeout:5000});
        await page.evaluate(() => { document.querySelector("[data-an-la='bundle offer:free gift:skip']").click(); });   
    }catch(e){
        console.log("gift3 X")
    }
    try{
        console.log("GIFT4");
        await page.waitForSelector("[an-la='free gift:bundle:add']",{timeout:5000});
        await page.evaluate(() => { document.querySelector("[an-la='free gift:bundle:add']").click(); });   
    }catch(e){
        console.log("gift4 X")
    }
        

        

        
 


    

    //
    //CART
     
    await page.waitForSelector("[class='cart-totals__wrapper'] [data-an-tr=cart-to-checkout]");    

    await eleControl.closePOPUPs(page);      
    await eleControl.closePOPUPs(page);      


    await page.evaluate(() => { document.querySelector("[class='cart-totals__wrapper'] [data-an-tr=cart-to-checkout]").click(); });        

    try{
        await page.waitForSelector("[data-an-la='bundle offer:free gift:skip']",{timeout:5000});
        await page.evaluate(() => { document.querySelector("[data-an-la='bundle offer:free gift:skip']").click(); });   
        console.log("GIFT POPUP SKIP");
    }catch(e){
        console.log("GIFT POPUP XX");
    }

        
        //CONTACTINFO----
        
        
        await page.waitForSelector("[class='ContactInfoFormMainContent has-components ng-star-inserted']");
        await page.waitForTimeout(3000);
        await eleControl.closePOPUPs(page); 
        await eleControl.closePOPUPs(page); 
        //TITLE
        await page.click("[class='ContactInfoFormMainContent has-components ng-star-inserted'] [class*='mat-select-required mat-select-empty']");
        await page.waitForTimeout(1000);
        await page.click("[class='mat-option-text']");        
        await page.waitForTimeout(500);
        //
        
        await page.focus('input[name="firstName"]');
        await page.keyboard.type('test');
        await page.focus('input[name="lastName"]');
        await page.keyboard.type('TEST');
        await page.focus('input[name="email"]');
        await page.keyboard.type('dykimww@gmail.com');
        await page.focus('input[name="phone"]');
        await page.keyboard.type('01012345678');
        await page.focus('input[name="postalCode"]');
        await page.keyboard.type('KT16 0PS');
        await page.waitForTimeout(3000);
        await eleControl.closePOPUPs(page);        
        await page.click("[class='dropWindow ng-star-inserted'] [role='option']");
        await page.waitForTimeout(5000);        


        //same as delivery
        await page.evaluate(()=>{
            let elements = document.querySelectorAll("[class='mat-checkbox-label']")
            for(let ele of elements){  
                console.log(ele.innerText)
                if(ele.innerText=="Same as Delivery Address") {
                    ele.click();
                }
            }
        });

        // await page.waitForTimeout(1000000);        
        //
        await page.waitForTimeout(5000);

        console.log("CONTINUE");
        await page.click("[class='pill-btn pill-btn--blue pill-btn--full-width cx-summary-orderBtn ng-star-inserted']");            
        await page.waitForTimeout(15000);
        //delivery(현재 공짜인거 선택)
        console.log("DELIVERY");
        await page.evaluate(()=>{
            let elements = document.querySelectorAll("[class='info-right-wrapper'] [class='info-right-checkbox-wrapper ng-star-inserted'] > label")
            for(let element of elements){
                if(element.getAttribute("for")=="group-0-deliveryMode-SEUK-DPD-WEEKDAY-ALLDAY-WEEE-50-G1") { 
                    element.click();
                }
            }
        })        
        await page.waitForTimeout(8000);        
        console.log("CONTINUE2")
        await page.click("[class='pill-btn pill-btn--blue cx-summary-continueBtn']");
        await page.waitForTimeout(15000);
        console.log("CHECKPOINT 3")
                
        //여기서부터 payments
        await eleControl.closePOPUPs(page); 
        let orderNumber = null;
        if(await setCreditCard(page,"cardInfo=notyet")){
            orderNumber = await getOrderNumber(page);
        }   
        else{
            console.log("payment fail");
        }         
        
        // if(await setPayPal(page,"cardInfo=notyet")){
        //     await getOrderNumber(page);
        // }   
        // else{
        //     console.log("payment fail");
        // }    
        return orderNumber;
    
        
}



/**
 * 
 */
async function getOrderNumber(page){
    await page.waitForTimeout(5000);
    const orderNumber = await page.evaluate(()=>{
        try{
            return document.querySelector("[class*='order-number'] [class='ng-star-inserted']").innerText;
        }catch(e){
            return null;
        }
    });
    console.log("orderNumber: "+orderNumber);
    return orderNumber;
}

 async function setPayPal(page,paypalInfo){
    try{
        console.log("-2")
        await clickPaymentTabs(page,"PayPal");
        console.log("-1")
        await page.evaluate(()=>{
            document.querySelector("[id='uk-checkoutMarketing'] div[class='mat-checkbox-frame']").click();
            document.querySelector("[id='uk-checkoutTermsCondition'] div[class='mat-checkbox-frame']").click();            
        })
        await page.waitForTimeout(4000);
        await clickiframeElement(page,"[title='PayPal']","#paypal-button");
        console.log("open popup");
        await page.waitForTimeout(5000);
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); 
        const popup = await newPagePromise;
        await popup.type("#email","wisewires.test.paypal1@gmail.com");
        await popup.type("#password","wise1234");
        await popup.click("#btnLogin");
        await popup.waitForTimeout(5000);
        //Pay with
        //내용삽입
        //-----------

        //Pay now
        await popup.click("#payment-submit-btn");

        await page.waitForTimeout(10000);

        console.log(":)")
        return getOrderNumber(page);        
    }catch(e){
        console.log(":(")
        return false;
    }

}
async function clickiframeElement(page,iframePath,elementPath){
    const elementHandle = await page.waitForSelector(iframePath);
    const frame = await elementHandle.contentFrame();
    await frame.waitForSelector(elementPath);
    const element = await frame.$(elementPath);
    await element.click();
}


async function setCreditCard(page,cardInfo){
    try{
        await clickPaymentTabs(page,"Credit Card");

        await setvalueToiframe(page,"[data-cse='encryptedCardNumber'] > iframe","[id='encryptedCardNumber']",'6771 7980 2100 0008'); //num
        await setvalueToiframe(page,"[data-cse='encryptedExpiryDate'] > iframe","[id='encryptedExpiryDate']",'0330'); //date
        await setvalueToiframe(page,"[data-cse='encryptedSecurityCode'] > iframe","[id='encryptedSecurityCode']",'737');    //cvc            
        await page.type("#input-holder-name","user");      

        console.log("check policy and click Button")          
        await page.evaluate(()=>{
            document.querySelector("[id='uk-checkoutMarketing'] div[class='mat-checkbox-frame']").click();
            document.querySelector("[id='uk-checkoutTermsCondition'] div[class='mat-checkbox-frame']").click();
            document.querySelector("[class='pill-btn pill-btn--blue']").click();
        })
        
        await page.waitForTimeout(5000);
        await page.type('#username',"user");
        await page.type('#password',"password");
        await page.click("input[type='submit']");
        await page.waitForTimeout(10000);

        console.log(":)")
        return true;
    }catch(e){
        console.log(":(")
        return false;
    }

}

/**target: "PayPal", "PayPal Credit", "Credit Card"...etc */
async function clickPaymentTabs(page,target){

    //init tabs
    console.log("initialize active tab");
    await page.evaluate(()=>{
        document.querySelector("[role='button'][class*='mat-expanded']").click();
    })
    await page.waitForTimeout(5000);
    console.log("Open "+target);
    let result = await page.evaluate((target)=>{
        let payments = document.querySelectorAll("[class*='payment-title']");
        for(let pay of payments){
            let payText = pay.innerText;
            if(payText==target) {
                pay.click();                
                return true;
            }
        }
        return false;
    },target);
    await page.waitForTimeout(5000);    
    return result;
}

/**iframe에 접근하기위한 함수                           
 * ex) await setvalueToiframe(page,"[data-cse='encryptedSecurityCode'] > iframe","[id='encryptedSecurityCode']",'737');                
*/
async function setvalueToiframe(page,iframePath,elementPath,value){
    const elementHandle = await page.waitForSelector(iframePath);
    const frame = await elementHandle.contentFrame();
    await frame.waitForSelector(elementPath);
    const inputText = await frame.$(elementPath);
    await inputText.type(value);        
}





