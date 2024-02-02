import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', defaultViewport : { width: 1920, height: 1680 }, headless: false });

var arr = [];
for(var i = 0; i < 5; i++) {
    arr[i] = await browser.newPage();
    await arr[i].goto("https://www.naver.com");
    
}
