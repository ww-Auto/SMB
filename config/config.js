
//////////////////////// URL Element Setting //////////////////////////
const { getCurrentDate } = require('../lib/getDate');

var baseURL = "https://stg-searchapi.samsung.com/v6/front/b2b/product/finder?";
var extraURL = "&num=12&sort=newest&onlyFilterInfoYN=N&keySummaryYN=Y&shopType=b2bhybris";
var APItype = [
            "01010000",
            "01020000",
            "01030000",
            "01040000",
            "01050000",
            "01070000",
            "01080000",
            "03010000",
            "07010000",
            "07020000",
            "07040000",
            "07050000",
            "08050000",
            "08060000",
            "08110000",
            "09010000",
            "07030000"
];
//실제 점검시 사용
// var nasPath = "Y:/smb/2024smb/hardlaunch/data/" + getCurrentDate() + "/";

/*
// 공유네트워크 말고 공유폴더 사용시 주석처리되어있는 nasPath사용
    var nasPath = "\\\\61.33.4.155\\공유\\smb\\2024smb\\hardlaunch\\data\\2024-02-22\\";
    var searchAPIPath = nasPath + "Search_API_Result\\";
    var pfgueatPath = nasPath + "PF_Guest\\"
    var entirePath = nasPath + "Entire\\"
    var tieredPath = nasPath + "Tiered Price\\"
*/

// 공유 네트워크 폴더 사용시 아래 nasPath 사용(주의 폴더명 Y: 이 부분 꼭 확인 or 폴더)
var nasPath = "Y:/smb/2024smb/hardlaunch/data/2024-02-22/"; 
var searchAPIPath = nasPath + "Search_API_Result/";
var pfgueatPath = nasPath + "PF_Guest/"
var entirePath = nasPath + "Entire/"
var tieredPath = nasPath + "Tiered Price/"

var datasave = "D:/SMB/outputs/";
var searchsave = datasave + "api/search/";
var bulksave = datasave + "api/bulk/";
var productsave = datasave + "api/product/";
var gusetsave = datasave + "PD_Guest/";
var Inculdetsave = datasave + "PD_Inculde/";
var Exculdesave = datasave + "PD_Exculde/";
var PFsave = datasave + "PF_Guest/";
var Entiresave = datasave + "Entire/";
var Tieredsave = datasave + "Tiered Price/";

var report = "D:/SMB/result/";
var productreport = report + "PD_API_Result/";

// export var APItype = ["01010000"]
var sitecode = ["lv", "lt", "ee", "tw", "hk", "hk_en", "kz_ru", "za", "hu", "co", "cl"];
var siteTi = ["tw", "hk", "hk_en", "hu", "co", "cl"];
var siteInEx = ["lv", "lt", "ee", "kz_ru", "hu", "cl"];
//export var extraURL = "&num=12&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&specHighlightYN=Y";
var cookie = 'uat-cookie=lv; _REDIRECT=false; __COM_SPEED=H; cookie_country=lv; directCallFlAA=undefined; ELOQUA=GUID=C8C9AE3B00524B40973C907FB393933C; glbState=GLBv2rt3eiou; returnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; dotcomReturnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; kndctr_470D362A62188DCD0A495F88_AdobeOrg_identity=CiY2NDYxODU1NTkwOTQwNjI2NTkyMzQyODkzNjg2MzA1MDQzNTU3MFITCMj6zJLhMRABGAEqBEpQTjMwAPAByPrMkuEx; kndctr_470D362A62188DCD0A495F88_AdobeOrg_consent=general%3Din; kndctr_470D362A62188DCD0A495F88_AdobeOrg_cluster=jpn3; AMCV_470D362A62188DCD0A495F88%40AdobeOrg=MCMID|64618555909406265923428936863050435570; kndctr_5B00B03459662D570A495C70_AdobeOrg_cluster=jpn3; kndctr_5B00B03459662D570A495C70_AdobeOrg_identity=CiY1NzM5OTcwNTE2NzY1NDU5OTc1MDA5MzkzNzkwODg4MzQ3NTk2MVITCMf6zJLhMRABGAEqBEpQTjMwAKABy%5FrMkuExsAEA8AHH%2DsyS4TE%3D; kndctr_5B00B03459662D570A495C70_AdobeOrg_consent=general%3Din; AMCV_5B00B03459662D570A495C70%40AdobeOrg=MCMID|57399705167654599750093937908883475961; _cs_mk_aa=0.11573386731424873_1709704429283; mbox=session%2357399705167654599750093937908883475961%2DBLcJjo%231709706289; mboxEdgeCluster=32; _ga_81QWW6BL1G=GS1.1.1709704429.1.0.1709704429.0.0.0; USAWSIAMSESSIONID=uJvnjtl1ZpSEhzSdnLsjkqQmwTIeQs11XYtDGIBGxZWTHl7t; _common_physicalAddressText=fub6bxswfdneadagaffd; sa_did=8ZSInpjAkY4SF32I8V7t8Hzo2ocIGw1R; G_ENABLED_IDPS=google; datadome=agoA9FhTIy5sY1A27gUUSZ7SDqMIiROzdz8M7nKp5XTwanU8w1uVcM~plefBz7~fkFIIdU_No8q3_Aas9rN_n7MHwwxukcS0lsUhy_Gfkoo7dIgTKyLtAdY86x5BTKcK; JSESSIONID=0D7FEAE19E1EB812EC57D3C09BF0B564; sa_id=509e627a1022b3c5a7e61572904088a8c2bc9c47d312ea06be2deaf3885672d2abb731009ce5b30b259f2de4ae62c27658d1660a443f70c5183f21d570f1e4ec445e66bfcf07c2f4a7c6b6836ea33dd77964aea403abb48ce3ad92683a12bc60683c5d75318a91f822185e4421dfb7c8487f4ffc0e8c92af1bd00da39a8959a4af40791043c95b19971234bb5af7fc1cc5679485445cc388f939e6c5c608e4db84b74bdbb640bd22cac2ae25689400f5009edc2cd336cbaeda6f977bc23f11d3cd27a2bc5da3c9055179721e26013059728d74fdf6693bcc8a9a290f1c; sa_state=xZKh9JhtBj0QX1x3nmL3cw1QRjgGXC1L; stk=e9af396bd2038d3f742f2c1e437c3154a4998c58ab88f0e534854b2817a22da6464f128fa658cf5641085b22fb8442f4fb2ab6f9261e1199ef4e84117b80becb06baf1cc44ec83a6c7a379a1da370b5e; xsdcbxyn=YGB; flpe=LTKlmY6B/nJ4BMXsOA/hBK9r5G1+wlGhwoRnzEdCkTWgmtl9a8cEOWQufcWMqPjGgNVn3LxkBY92tK+ZLwW2kgQIZJlxeyERuXGaad8uclivv8IZF1zDUwWiaUf6LeYMXB+B654eXVE28ylPzDZLLQ==; guid=i3akkkgpkj; directCallFl=N; encGuid=0xB3FEA34530DE77833CD5102DE8B83BFAA1D0947F3648733483EB555C7523827E; ReD=724ca5099d60781996bfa56e2ecee36d75dc128624d2238630b9f9154295f272|8eea70275b9cd6947d5d5a9e88c0919c|f0f6471e5885f6d956033926aada906220a634a6f35919815fc9aa9bfef7305f|us-auth2.samsungosp.com|f6e26d39dacf15582b2009c2fdf3895b; lvsme_jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6IjMwNGQ1YzkyLWQ0NWItNDMzZi05NTFlLWY5NmUwN2Q4MTA2YSIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwOTcwODA0NiwidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwOTcwNDQ0Nn0.aZLzMp5LikpmEDgpwJFwuJ9tRRWHoqrZ1f9fzEgvZAKGpp61gNzpa1_IEfJSrEVj7dF6cYDdxF9lpKTXhTzM1UdLKi49al3LnCDZrXV9i8b2udfzKu-bFetN-KGL24o1cSJTbr_o-gDbYb8z-ncIEHIh4lokZuffrOCgxldAJ27b_TBJ2pi06a7eVM7u-P9WAAP2DRVWmuDWvoToqQJ-FGUBlfzp8hUSgQJiev_K5_Bp9JtCD9dUtkHNRx0PmdhTgVWMmeu1TaQ_xCcOXDcporsXty3o7ncYE9CbzEMfmUYMpIBIygau6f2DxpfKmIvALqyNewT2Y1CMtAq9m10O09JJdAFqWJzJ59HXJOqjpSQI-81rdI1XBGQIK3W0H3OvMExkZa6X8w9nMG7FKJlgDLVtxsumWvoB4YnYR3fxOAbTPfQBgPQ7_19qxBQXsdPfmIo1wQzQS5GA3WwCLl0AxFaW-uxZ3UVcUfuxXCS1Y6JBZL5f_PZzm840t3m7gv9ew9hudgDT_gpMmdi2o0o1wKGNQcGllmBpYUyomDEFfTp8Omf_BoQbojud9MhT0DvPFPH33-e63SH-6fmLmfJlHpg8SaMmd7GAMeqUfvYzFgi8xz7fh50W9Zg-l9wwhsc38slT-xa2fZQzgc2MT0wDRqYchShZl98Ei3J7i3lQ9Os; jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6IjMwNGQ1YzkyLWQ0NWItNDMzZi05NTFlLWY5NmUwN2Q4MTA2YSIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwOTcwODA0NiwidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwOTcwNDQ0Nn0.aZLzMp5LikpmEDgpwJFwuJ9tRRWHoqrZ1f9fzEgvZAKGpp61gNzpa1_IEfJSrEVj7dF6cYDdxF9lpKTXhTzM1UdLKi49al3LnCDZrXV9i8b2udfzKu-bFetN-KGL24o1cSJTbr_o-gDbYb8z-ncIEHIh4lokZuffrOCgxldAJ27b_TBJ2pi06a7eVM7u-P9WAAP2DRVWmuDWvoToqQJ-FGUBlfzp8hUSgQJiev_K5_Bp9JtCD9dUtkHNRx0PmdhTgVWMmeu1TaQ_xCcOXDcporsXty3o7ncYE9CbzEMfmUYMpIBIygau6f2DxpfKmIvALqyNewT2Y1CMtAq9m10O09JJdAFqWJzJ59HXJOqjpSQI-81rdI1XBGQIK3W0H3OvMExkZa6X8w9nMG7FKJlgDLVtxsumWvoB4YnYR3fxOAbTPfQBgPQ7_19qxBQXsdPfmIo1wQzQS5GA3WwCLl0AxFaW-uxZ3UVcUfuxXCS1Y6JBZL5f_PZzm840t3m7gv9ew9hudgDT_gpMmdi2o0o1wKGNQcGllmBpYUyomDEFfTp8Omf_BoQbojud9MhT0DvPFPH33-e63SH-6fmLmfJlHpg8SaMmd7GAMeqUfvYzFgi8xz7fh50W9Zg-l9wwhsc38slT-xa2fZQzgc2MT0wDRqYchShZl98Ei3J7i3lQ9Os; estoreSitecode=lv; estoreSitecode_cm=smn3; directCallFlv2=Y; estoreLoginRequesting=Y';
///////////////////////////////////////////////////////////////////////

module.exports.baseURL = baseURL;
module.exports.extraURL = extraURL;
module.exports.APItype = APItype;
module.exports.nasPath = nasPath;
module.exports.searchAPIPath = searchAPIPath;
module.exports.pfgueatPath = pfgueatPath;
module.exports.entirePath = entirePath;
module.exports.tieredPath = tieredPath;
module.exports.sitecode = sitecode;
module.exports.siteTi = siteTi;
module.exports.siteInEx = siteInEx;
module.exports.cookie = cookie;
module.exports.datasave = datasave;
module.exports.searchsave = searchsave;
module.exports.bulksave = bulksave;
module.exports.productsave = productsave;
module.exports.report = report;
module.exports.productreport = productreport;
module.exports.gusetsave = gusetsave;
module.exports.Inculdetsave = Inculdetsave;
module.exports.Exculdesave = Exculdesave;
module.exports.PFsave = PFsave;
module.exports.Entiresave = Entiresave;
module.exports.Tieredsave = Tieredsave;

