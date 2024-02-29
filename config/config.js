
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

var nasPath = "Y:/smb/2024smb/hardlaunch/data/2024-02-23/"; 
var searchAPIPath = nasPath + "Search_API_Result/";
var pfgueatPath = nasPath + "PF_Guest/"
var entirePath = nasPath + "Entire/"
var tieredPath = nasPath + "Tiered Price/"

// export var APItype = ["01010000"]
var sitecode = ["lv", "lt", "ee", "tw", "hk", "hk_en", "kz_ru", "za", "hu", "co", "cl"];
var siteTi = ["tw", "hk", "hk_en", "hu", "co", "cl"];
//export var extraURL = "&num=12&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&specHighlightYN=Y";
var cookie = 'uat-cookie=lv; _REDIRECT=false; __COM_SPEED=H; cookie_country=lv; directCallFlAA=undefined; ELOQUA=GUID=5E4901449E2F4368B0259F9337AFF49A; kndctr_470D362A62188DCD0A495F88_AdobeOrg_identity=CiY1Njc4ODQyMTI3NzYzNzg2NjczMTc3Njc2MTI1MTUzMjI5MTg0MFITCMyDkr3XMRABGAEqBEpQTjMwAPABzIOSvdcx; kndctr_470D362A62188DCD0A495F88_AdobeOrg_consent=general%3Din; kndctr_470D362A62188DCD0A495F88_AdobeOrg_cluster=jpn3; kndctr_5B00B03459662D570A495C70_AdobeOrg_cluster=jpn3; kndctr_5B00B03459662D570A495C70_AdobeOrg_identity=CiYxMjQzMjUxMzk3NzI3NTA1MzkxMjgyNDI1MjYzMzMxODk2Nzg3NlITCMyDkr3XMRABGAEqBEpQTjMwAKAB0YOSvdcxsAEA8AHMg5K91zE%3D; kndctr_5B00B03459662D570A495C70_AdobeOrg_consent=general%3Din; AMCV_470D362A62188DCD0A495F88%40AdobeOrg=MCMID|56788421277637866731776761251532291840; AMCV_5B00B03459662D570A495C70%40AdobeOrg=MCMID|12432513977275053912824252633318967876; _cs_c=0; _cs_id=52ab376a-9bb0-ae46-ceed-93d4dae08c33.1707109287.1.1707109287.1707109287.1.1741273287655.1; _cs_s=1.0.0.1707111087656; _cs_mk_aa=0.2895516907676574_1707109288002; mbox=session%2312432513977275053912824252633318967876%2DKSdXkY%231707111146; mboxEdgeCluster=32; FPAU=1.2.462894242.1707109287; tmr_lvid=5656bc3e7b923d02ba16e8e487ab7fb2; tmr_lvidTS=1707109288506; lantern=5e713141-d58f-460e-a98a-6ff5dc4b9299; _fbp=fb.1.1707109288919.168779684; glbState=GLB82m35igqln2; returnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; dotcomReturnURL=https%3A%2F%2Fhshopfront.samsung.com%2Flv%2Fbusiness%2Fsmartphones%2Fall-smartphones%2F; _ga_81QWW6BL1G=GS1.1.1707109287.1.0.1707109289.0.0.0; usi_id=2sar6z_1707109289; _common_physicalAddressText=mcj1tjlvvrowacafafab; sa_did=RI48ynQqBw0IhTPXmRC8vHT2n7FtfO8O; APAWSIAMSESSIONID=Y2UzNjY4MTYtODUxYy00YmUxLWJiMjMtNGNmZjMzMmVhZmNm; G_ENABLED_IDPS=google; datadome=vyQqQoHj5IKLrwA3sfWmqPATJZgL22vvpY3Uhy3A02BjtcsRYp1OgnNI4znqmiwW~~Zxa7GJaPU4ipbHLhQl1likhGUnwUC8fiG11iXr9h2jhkzx0bHPEegyClhs2dI~; sa_id=2d25aa7485feb84d9279f465e5eef1cd57888c203261353f6ef5b03d4b85b12c9b1a761fb97aa3eb0f1ccfd5afcc4d71cb62eede99652a6d0a4be0edf9ff58417700653dcc9b32bc090d10e58605c7b597dd43a24c1c83ef71924b9b53dfe71bc25246159c3fcc58fda7ab3ee152aba867ff69756382eab971b9532b2e4de61291408a95deb7f8ef4a066dd8040ad3ec3e08d7860203761fb36a7a945731fee408dc02a2012dfc33c24ff979c13286924369f36b79dea1ab9bd8f648d01f3d480c37e9bc652f86c26ff516db53a73fa21467e148f11287c0e38cc89ab6; sa_state=DcctoVpeEYTII2T6XX5K8jjF0YlhTdX6; stk=7dbd8af461b711e576b5cce52607a8d55750ac4fb6e128248ca9c0057a8bebab0c7863a08ea74d44df6aa3e738426aa56096ec03c3ef47c6abab3fea254161c206baf1cc44ec83a6c7a379a1da370b5e; xsdcbxyn=YGB; flpe=LTKlmY6B/nJ4BMXsOA/hBK9r5G1+wlGhwoRnzEdCkTWgmtl9a8cEOWQufcWMqPjGgNVn3LxkBY92tK+ZLwW2kgQIZJlxeyERuXGaad8uclivv8IZF1zDUwWiaUf6LeYMXB+B654eXVE28ylPzDZLLQ==; guid=i3akkkgpkj; directCallFl=N; directCallFlv2=N; encGuid=0xB3FEA34530DE77833CD5102DE8B83BFAA1D0947F3648733483EB555C7523827E; ReD=5733597bda96b93ded0b9c7294c2676c3853b8ec83595194dfdfb832ccc15dde|8eea70275b9cd6947d5d5a9e88c0919c|332232da102a6b79ab14796ff399be9320a634a6f35919815fc9aa9bfef7305f|eu-auth2.samsungosp.com|f6e26d39dacf15582b2009c2fdf3895b; lvsme_jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6IjBmMjJkNGExLWQ0YzktNDgyMS05N2ZiLWI4ODAwYzVmOWY5YSIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwNzExMjkyMywidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwNzEwOTMyM30.SgjTeLw_-ndGzAqJ8U7wboNul7p-KDDX8jr9HUx4hAz8MmD4IqNpGv_iC2EjVMTrkmzwDqnuhEiezU6YgKoMWsh_zt9TT7EhyoPFtuHRvNuXUAbCRC0ZZRS-z62fmF6vw4N-40o8Ubs2JENniJWco6Q3R9Hwctn8zz64gEsk2YCvhwYgL_TPPqUMz-xvzdt448eb5YhFA0c-vHv9-73nl8EZMqzLCdOlEkWztoJeWBbp60l9a7BUSor4gVuYSJpnocWXN593NTTVhDJOgNFPutp2woVVdKbXDixV6C2Iq6zLYmlJsDcbJyuUJkdbNpAPUHpHiwEmWmAO-HvrTg3ZnJ38QA8kzDpteciUN-p-_z1xDltAq6Ecu-BVY6k7vvd9ZcP0yH-xaLFUpYknh3z6kGwCqbx2DnT8lqcebiadsak8C_AZNdEsavUOShJxgTXnBEEtdcAwT-FWV-tKphsEho_bUvcerGgWVDN1fNWzyrJojE_zeoi_8JjnRpL54s4LiLZOZun4hqMsv0JbMSdiuhkqqSFCRT0Ych8hoh4cAVxY84_Xiu2sj0EARzZB0end61ES5OMEPwRTKGgWLItgy6-VB9wjWN8jzWhfzjezbIM_LOK2ZENa9UTDA_uq2WxO_LIgHwNK-5KTzBFwq01MTCHqRMI22YOGeegynL6pKSI; jwt_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJjYXJ0R3VpZCI6IjBmMjJkNGExLWQ0YzktNDgyMS05N2ZiLWI4ODAwYzVmOWY5YSIsImprdSI6Imh0dHBzOi8vczMtc21uMy1hcGktY2RuLmVjb20tc3RnLnNhbXN1bmcuY29tL3Rva29jb21tZXJjZXdlYnNlcnZpY2VzL3YyL2x2c21lL2p3dC9rZXlzIiwiaXNzIjoidG9rbyIsImlwQWRkcmVzcyI6IjE5Mi4xNjguMC4wIiwidXNlclR5cGUiOiJDdXN0b21lciIsImV4cCI6MTcwNzExMjkyMywidXNlcklkIjoiaTNha2trZ3BraiIsImlhdCI6MTcwNzEwOTMyM30.SgjTeLw_-ndGzAqJ8U7wboNul7p-KDDX8jr9HUx4hAz8MmD4IqNpGv_iC2EjVMTrkmzwDqnuhEiezU6YgKoMWsh_zt9TT7EhyoPFtuHRvNuXUAbCRC0ZZRS-z62fmF6vw4N-40o8Ubs2JENniJWco6Q3R9Hwctn8zz64gEsk2YCvhwYgL_TPPqUMz-xvzdt448eb5YhFA0c-vHv9-73nl8EZMqzLCdOlEkWztoJeWBbp60l9a7BUSor4gVuYSJpnocWXN593NTTVhDJOgNFPutp2woVVdKbXDixV6C2Iq6zLYmlJsDcbJyuUJkdbNpAPUHpHiwEmWmAO-HvrTg3ZnJ38QA8kzDpteciUN-p-_z1xDltAq6Ecu-BVY6k7vvd9ZcP0yH-xaLFUpYknh3z6kGwCqbx2DnT8lqcebiadsak8C_AZNdEsavUOShJxgTXnBEEtdcAwT-FWV-tKphsEho_bUvcerGgWVDN1fNWzyrJojE_zeoi_8JjnRpL54s4LiLZOZun4hqMsv0JbMSdiuhkqqSFCRT0Ych8hoh4cAVxY84_Xiu2sj0EARzZB0end61ES5OMEPwRTKGgWLItgy6-VB9wjWN8jzWhfzjezbIM_LOK2ZENa9UTDA_uq2WxO_LIgHwNK-5KTzBFwq01MTCHqRMI22YOGeegynL6pKSI; estoreSitecode=lv; estoreSitecode_cm=smn3';
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
module.exports.cookie = cookie;

