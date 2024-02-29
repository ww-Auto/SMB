const getCurrentDate =() =>{
    var date = new Date();    
    var yyyy = date.getFullYear();     
    var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);    
    var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();            
    return (yyyy + "-" +  MM + "-" + dd);
 }

const getCurrentTime =() =>{
    var date = new Date();    
    var hour = date.getHours();    
    var min = date.getMinutes();    
    
    return (hour +""+ min); //ex) 2403
 }

module.exports.getCurrentDate = getCurrentDate;
module.exports.getCurrentTime = getCurrentTime;
