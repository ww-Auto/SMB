

import request from 'request';
import fs from "fs";


var filePath = "../result/Search_API_Result/"
console.log(filePath);
var rsData = new Array();
var rsData2 = new Array();
var rsData3 = new Array();
var rsData4 = new Array();
var rsData5 = new Array();
var rsData6 = new Array();
var rsData7 = new Array();
var rsData8 = new Array();
var rsData9 = new Array();
var rsData10 = new Array();
var rsData11 = new Array();

fs.readdir(filePath, function (err, file) {
  if (err) return console.log(err);
  if (file == null) {
    console.log("디렉토리에 파일이 없습니다.")
  }
  else {
    for (var a = 0; a < file.length; a++) {
      console.log(file[a]);
      READ_SKU(file[a]);
    }
  }
});
 
// 리스트만큼 SKU 읽어옴
async function READ_SKU(fileName) {
  fs.readFile(filePath + '/' + fileName, 'utf8', (error, jsonFile) => {
    if (error) return console.log(error);
    const jsonData = JSON.parse(jsonFile);

    for (var b = 0; b < jsonData.length; b++) {
      var sSKU = jsonData[b].modelCode;
      var siteCode = jsonData[b].sitecode; 
      
      makeURL(sSKU, siteCode);
    }


  });
}

// const backupPath = "Y:/smb/type_2/sit/data/"+getDate.getCurrentDate()+"_data/PD_API/"+getDate.getCurrentTime();
// console.log(backupPath);

// URL 만들기
function makeURL(sSKU, siteCode) {
  var url;

    switch (siteCode) {
      case 'lv':
          url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/lvsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'lt':
          url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/ltsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'ee':
          url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/eesme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'tw':
          url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/twsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'hk':
          url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'hk_en':
          url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/'+ sSKU +'/**?fields=SIMPLE_INFO&lang=en_HK';
          break;
      case 'kz_ru':
          url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/kzsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO&lang=ru_KZ';
          break;
      case 'za':
          url = 'https://s3-smi-api.ecom-stg.samsung.com/tokocommercewebservices/v2/zasme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
         break;
      case 'hu':
          url = 'https://s3-smn-api.ecom-stg.samsung.com/tokocommercewebservices/v2/husme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'co':
          url = 'https://s3-smb-api.ecom-stg.samsung.com/tokocommercewebservices/v2/cosme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      case 'cl':
          url = 'https://s3-smb-api.ecom-stg.samsung.com/tokocommercewebservices/v2/clsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
          break;
      default:
          break;
  }
   //console.log("-----------");
   //console.log("File: "+siteCode);
   //console.log("URL: "+url);
   //console.log("SKU: "+sSKU);
   //console.log("-----------");
   if(siteCode != "za"){
    runPDAPI(url, siteCode, sSKU);
   }
}

// API Requst Response (데이터 가공)
async function runPDAPI(url, sitecode, sSKU) {

  var cook = 's_fpid=a02d55f5-b7dd-40f3-a813-81ffd9fe1842; _fwb=247Y9G0CzXpCbY16R2FebDP.1704759534266; _AT_vid=PM7BIUDKO2913YKUV0WJ70P22ISUXMXB; __nta_uid=1704759536216324804; _gcl_au=1.1.1939407415.1704759537; _ga_HKQZDLVWPN=GS1.1.1704759537.1.0.1704759537.60.0.0; s_ecid=MCMID%7C69348627141904739692722261690748604808; _abx__0nCtQ3s60km0zcXUGeZZBQ=i4JffTYow0RTnKUqbVSA5ZRYzGwzXKqwazgKZuAFHRnP9mlABKjx84U32yXGLWjG+Dy464DkjbfVTVpj5wCyVmBtAJtsXBiXAuomTvVen1CXOmN7KoFcRuMvhV7HkcP0a5nTRnuvtUobKiFrCuTlVqdpVAfztA6/kDMqorfQS4buoyVrxJcniElEhMGMTS67NTU6YVK27DWjDOlbl/MpKR/9rEytFMdNlCb4BsQ33xF086HtIyS8A0DOZ9umXzxLg0s4IUD+/9q+5VFCT03Ss1kl4QJP9dOzDMBDNZHLkM69MxTHWoCrBatNMs/ljxsu+eGzH8etYF3mdQqbjq1qz4Yd3VkI3gGL3H2Yfub+0nLhyybFAvNRKSB2oUynrRBUW+vDh0eSeZQRjEUadVusnk/sDrouAcD+pKmNZaP4tGeHGxhR/rKPvwLRYP7IQkdoM1mMT1SUFIx+WszBm2OnXslduCR3ViRsCgfK3XtnegwcbibxcZ4ogS22ey2oObb+RVSWzT2Uve67AoDNPiRNvEuOvGsYUtNHCBx/xea1V8nhmi8d+XEpAo5KqAfuAiaeS98aBbZlZmB1aiuIps2CeA==; AMCV_FEF0834558111A970A495CC9%40AdobeOrg=1176715910%7CMCIDTS%7C19732%7CMCMID%7C69348627141904739692722261690748604808%7CMCAAMLH-1705364338%7C11%7CMCAAMB-1705364338%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1704766740s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.4.0; _fbp=fb.1.1704759541876.1751707230; _cs_c=1; _cs_id=9ed6c958-732f-a535-c425-bfe90fd943f2.1704759542.1.1704759542.1704759542.1.1738923542201; kndctr_C5D8694E5994D9EB0A495E34_AdobeOrg_identity=CiY2OTM0ODYyNzE0MTkwNDczOTY5MjcyMjI2MTY5MDc0ODYwNDgwOFIRCK6xtNDRMRgBKgRKUE4zMAOgAbWxtNDRMbABAPABrrG00NEx; FPAU=1.1.1939407415.1704759537; _vwo_uuid=DED5E238D9B16809C1B77ACFE815AB03D; _vis_opt_s=1%7C; _vwo_ds=3%3At_0%2Ca_0%3A0%241705539086%3A49.55161356%3A%3A%3A4_0%2C3_0%3A1; _ga_1Y8SWQHLVR=GS1.1.1705542393.2.1.1705542399.0.0.0; cto_bundle=0czBK193TW13QmZQRTBLTHp6aVRhb0s1THhDR2t4YWtNWWhRWVFTY3lDWXpNaXJuUHElMkZqbE5scVFJM0w1MkJPeXU1RlFxNmt2ekZDOWJMWjlkeE1URDZyJTJGZ0lZTlpBR0hDeXdBNXFQTTlxcUdPYmc2MG96JTJCdnB1VWVJbXY3VkY2ZXowNm5aV2dNc1ExQm9tUHZMRUdDaHhwN0ElM0QlM0Q; ELOQUA=GUID=557A1DFF915A49E68BBBB723768B7BCC; kndctr_470D362A62188DCD0A495F88_AdobeOrg_consent=general%3Din; kndctr_5B00B03459662D570A495C70_AdobeOrg_consent=general%3Din; _common_physicalAddressText=squoevguuxizabbiabeg; sa_did=404HJ3wo43Xcg2S3ly4tOPWnD9noBC0X; G_ENABLED_IDPS=google; sa_did=404HJ3wo43Xcg2S3ly4tOPWnD9noBC0X; tmr_lvid=63b3c848dd172d02ad268d629326d28d; tmr_lvidTS=1705542640553; estoreSitecode=lv; estoreSitecode_cm=smn3; kndctr_BB8C3FFD5A672C3D0A495D2D_AdobeOrg_identity=CiY2OTM0ODYyNzE0MTkwNDczOTY5MjcyMjI2MTY5MDc0ODYwNDgwOFIRCJfxvKnTMRgBKgRKUE4zMAPwAZfxvKnTMQ%3D%3D; _uetvid=992e6a30b9bf11eebb2d55b2050d7e2c; __qca=P0-615417252-1705994305440; _ga_85Z0Y3SJ0E=GS1.1.1705994304.1.1.1705994496.0.0.0; visid_incap_2563518=l8IIPfAsRpG3/mw2wnJsmBtpr2UAAAAAQUIPAAAAAAApQ1ywiNH885N4HzlUKTGv; uat-cookie=lv; _REDIRECT=false; __COM_SPEED=H; cookie_country=lv; kndctr_5B00B03459662D570A495C70_AdobeOrg_cluster=jpn3; kndctr_5B00B03459662D570A495C70_AdobeOrg_identity=CiY2OTM0ODYyNzE0MTkwNDczOTY5MjcyMjI2MTY5MDc0ODYwNDgwOFIRCLn5%5F9HRMRgBKgRKUE4zMAOgAePhyKnTMbABAPAB88SB8tMx; glbState=GLBoh0qrvxtf5; returnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; dotcomReturnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; _cs_mk_aa=0.6944159088060291_1706146424246; AMCVS_5B00B03459662D570A495C70%40AdobeOrg=1; AMCV_5B00B03459662D570A495C70%40AdobeOrg=179643557%7CMCMID%7C69348627141904739692722261690748604808%7CMCIDTS%7C19748%7CMCAID%7CNONE%7CMCOPTOUT-1706153624s%7CNONE%7CMCAAMLH-1706751224%7C11%7CMCAAMB-1706751224%7Cj8Odv6LonN4r3an7LhD3WZrU1bUpAkFkkiY1ncBR96t2PTI%7CvVersion%7C5.5.0; kndctr_470D362A62188DCD0A495F88_AdobeOrg_identity=CiY2OTM0ODYyNzE0MTkwNDczOTY5MjcyMjI2MTY5MDc0ODYwNDgwOFIRCLn5%5F9HRMRgBKgRKUE4zMAPwAc%5FLgfLTMQ%3D%3D; kndctr_470D362A62188DCD0A495F88_AdobeOrg_cluster=jpn3; mboxEdgeCluster=32; EUAWSIAMSESSIONID=MjkyYWUzM2EtOTVjZC00YjkwLWFmMzMtMzRjMjZhYzUwNDc3; datadome=cv~s4SGP5_RBfgxSYYOgMUacRK92tjaMNbwiHBIwU3Qf_pYmZbT68kqfPgxL1cGwh9KT9RCztYM6ZIa3gNgb9ULSB68yXp1LREL9BJVa_x0SiaURf28LKivDjbo8lQqZ; sa_id=4301dde38b3c5ded736f2bc082cc45ab6bdb11db1020ff2ff19d3ab2ff231f3e0fa4b9b16675699783e2ceaa808293208475f686114433c744bf3b6fa686973190fffe2177d80dd9c6984e3653bedbf448ac48e934a4606083fdb6ed362da4ce5f00bc394b5f9d17a59c66c47bf710f372dba485593b592389a5f8891508facfc3c3ff7b4dc2b51dc24ea4dd4085e08aa5fea95074eec72f602ff1ea4271eb3d8d04a9260a5be6fc1a2c4bbd418d13d26e7af0d6d03795bf64c9ff89e2af80e24ad85916d304d1d6fa6d79275cc5a16abc3167e1e913f9dbb7e8540708; sa_state=45Re6EeZIKlcTLb7OREuSFAbKNRIRkZz; stk=d279a3a486fa02232a40937aca6ac5b60dc847b4295b2f9def82543d7b2e884e515e1099b75b468f7c9b49d0578d20126f39db51291977d256fef1337e1a7f4506baf1cc44ec83a6c7a379a1da370b5e; xsdcbxyn=YGB; flpe=LTKlmY6B/nJ4BMXsOA/hBK9r5G1+wlGhwoRnzEdCkTWgmtl9a8cEOWQufcWMqPjGgNVn3LxkBY92tK+ZLwW2kgQIZJlxeyERuXGaad8uclivv8IZF1zDUwWiaUf6LeYMXB+B654eXVE28ylPzDZLLQ==; guid=i3akkkgpkj; directCallFl=N; encGuid=0xB3FEA34530DE77833CD5102DE8B83BFAA1D0947F3648733483EB555C7523827E; ReD=6d6d378ee6b2f1cd578b56db4bba69cebd38468833cb1ae3679ae58333d1308d|8eea70275b9cd6947d5d5a9e88c0919c|332232da102a6b79ab14796ff399be9320a634a6f35919815fc9aa9bfef7305f|eu-auth2.samsungosp.com|f6e26d39dacf15582b2009c2fdf3895b; lvsme_jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6ImE5ZWM3M2Q3LWQzODEtNDEwYy1iZmU0LWY1NGFlNzQwNmE0MyIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwNjE1MDA0NCwidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwNjE0NjQ0NH0.YCkPt8sTPQQsIk3UmRo-owa_onBiNmjtYs63VyAavIxqodI826J-yc-0K0EdMhGxARJVrCEZ82FLHD90ytH_CUidhFGmwh6vq4Q97pYc8h8pjGICVgtnezleUxsAVZHVAwzXTNEMAmq3NmUIqcMqerC-AEmcSYvr8Uq4P0I_Jh31y4eJEw7S8yEOlfCIBWaoPvZ_1VZZpw7F2h0KTOm_uqRasOVpPp4WgkM4juC9NIiG3wrjzLnYXWrlG9RfloybGiGwFWALtUEkRt3ROIPrNTcHfUAyzYVgP17YRSfeTroVJg_PnvlrVY74XD9ZTbIlLUcHVHS4CZY02t0h1sYD-tsXJUky_qMbLNUj3XscN7hrtPdgVU4JmormywA33qTAtTFMzwjQEtIfB4Smn4TlFC2Q9Sv8_tn51nF8Ve4o6Qds033RmlMUW8eTdPNjr4OsTHtVh245yLO_lgpcWdf5ncPQDbWXDHuXWoq1RNxZWPrXPQ-J92eqwulg1m2BvjqpPcsvsr31G0GBSO2x6ZXdTigent-9ewcZu9ztuftgVjcCtPZxroDbqy42G2zO1ZSp8B-kRpfYMiAC3fRQyj_b9zZlsndQKoeNTGjytn_CCuES1UrxPyFuzaZP_bjSxSfwZ6TbDLoaT91MOdE5rgo7EP1PsLactV-VXloGxS8wY3o; jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6ImE5ZWM3M2Q3LWQzODEtNDEwYy1iZmU0LWY1NGFlNzQwNmE0MyIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwNjE1MDA0NCwidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwNjE0NjQ0NH0.YCkPt8sTPQQsIk3UmRo-owa_onBiNmjtYs63VyAavIxqodI826J-yc-0K0EdMhGxARJVrCEZ82FLHD90ytH_CUidhFGmwh6vq4Q97pYc8h8pjGICVgtnezleUxsAVZHVAwzXTNEMAmq3NmUIqcMqerC-AEmcSYvr8Uq4P0I_Jh31y4eJEw7S8yEOlfCIBWaoPvZ_1VZZpw7F2h0KTOm_uqRasOVpPp4WgkM4juC9NIiG3wrjzLnYXWrlG9RfloybGiGwFWALtUEkRt3ROIPrNTcHfUAyzYVgP17YRSfeTroVJg_PnvlrVY74XD9ZTbIlLUcHVHS4CZY02t0h1sYD-tsXJUky_qMbLNUj3XscN7hrtPdgVU4JmormywA33qTAtTFMzwjQEtIfB4Smn4TlFC2Q9Sv8_tn51nF8Ve4o6Qds033RmlMUW8eTdPNjr4OsTHtVh245yLO_lgpcWdf5ncPQDbWXDHuXWoq1RNxZWPrXPQ-J92eqwulg1m2BvjqpPcsvsr31G0GBSO2x6ZXdTigent-9ewcZu9ztuftgVjcCtPZxroDbqy42G2zO1ZSp8B-kRpfYMiAC3fRQyj_b9zZlsndQKoeNTGjytn_CCuES1UrxPyFuzaZP_bjSxSfwZ6TbDLoaT91MOdE5rgo7EP1PsLactV-VXloGxS8wY3o; directCallFlv2=Y; useSMBCookiePaths=%2Flv%2F%3B; directCallFlAA=Y; mbox=session%2308c9c83627b24f8b8eb5b8bbbf73c236%231706148306%7CPC%2308c9c83627b24f8b8eb5b8bbbf73c236%2E32%5F0%231768004341; _ga=GA1.1.374271082.1704759538; _ga_81QWW6BL1G=GS1.1.1706146425.5.1.1706146513.0.0.0';

  var headers = {
    'Cookie': cook,
    Credential: "include",
  }


  var options = {
    url: url,
    headers: headers,

  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = body;
      var json = JSON.parse(result);
      var temp = "";
      var temp2 = "";
      var temp3 = "";
      var temp4 = "";
      var temp5 = "";
      var rsJson = new Object();


      try {

        for (var g = 0; g < json.exVatTieredPrices.length; g++) {

          var c = json.exVatTieredPrices[g].formattedValue;
          temp = temp + c + "/"

          var a = json.exVatTieredPrices[g].minQuantity;
          temp2 = temp2 + a + "/"

        }
        // console.log(sitecode);
        // console.log(temp);        
      } catch (e) {

      }

      try {
        for (var t = 0; t < json.tieredPrices.length; t++) {

          var ta = json.tieredPrices[t].formattedValue;
          temp3 = temp3 + ta + "/"

          var tc = json.tieredPrices[t].minQuantity;
          temp4 = temp4 + tc + "/"

        }
      } catch (e) {

      }


     
        rsJson.Site = sitecode;
        rsJson.SKU = sSKU;
        rsJson.exVatTieredPrices_value = temp;
        rsJson.exVatTieredPrices_minQuantity = temp2;
        rsJson.TieredPrices_value = temp3;
        rsJson.TieredPrices_minQuantity = temp4;
        try{
          rsJson.price_formattedValue = json.price.formattedValue;
        }
        catch(e){
          rsJson.price_formattedValue = ""
        }
      
      
      //console.log(rsJson); 
        
      if(sitecode == "lt") {
        rsData.push(rsJson);
        const test = JSON.stringify(rsData, null, 4);
        fs.writeFileSync("../result/Product/PD_API_lt.json", test);        
      } else if (sitecode == "lv") {
          rsData2.push(rsJson);
          const test = JSON.stringify(rsData2, null, 4);
          fs.writeFileSync("../result/Product/PD_API_lv.json", test);
      } else if (sitecode == "ee") {
          rsData3.push(rsJson);
          const test = JSON.stringify(rsData3, null, 4);
          fs.writeFileSync("../result/Product/PD_API_ee.json", test);              
      } else if (sitecode == "tw") {
          rsData4.push(rsJson);
          const test = JSON.stringify(rsData4, null, 4);
          fs.writeFileSync("../result/Product/PD_API_tw.json", test);
      } else if (sitecode == "hk") {
          rsData5.push(rsJson);
          const test = JSON.stringify(rsData5, null, 4);
          fs.writeFileSync("../result/Product/PD_API_hk.json", test);          
      } else if (sitecode === "hk_en") {
          rsData6.push(rsJson);
          const test = JSON.stringify(rsData6, null, 4);
          fs.writeFileSync("../result/Product/PD_API_hk_en.json", test);          
      } else if (sitecode === "kz_ru") {
          rsData7.push(rsJson);
          const test = JSON.stringify(rsData7,null,4);
          fs.writeFileSync("../result/Product/PD_API_kz_ru.json", test);        
      } else if (sitecode === "za") {
          rsData8.push(rsJson);
          const test = JSON.stringify(rsData8, null, 4);
          fs.writeFileSync("../result/Product/PD_API_za.json", test);          
      } else if (sitecode === "hu") {
          rsData9.push(rsJson);
          const test = JSON.stringify(rsData9, null, 4);
          fs.writeFileSync("../result/Product/PD_API_hu.json", test);
      } else if (sitecode === "co") {
          rsData10.push(rsJson);
          const test = JSON.stringify(rsData10, null, 4);
          fs.writeFileSync("../result/Product/PD_API_co.json", test);                    
      } else if (sitecode === "cl") {
          rsData11.push(rsJson);
          const test = JSON.stringify(rsData11, null, 4);
          fs.writeFileSync("../result/Product/PD_API_cl.json", test);          
      }

    }
    else {
      console.log(`body data => ${error}`+url)
    }
  });
}







