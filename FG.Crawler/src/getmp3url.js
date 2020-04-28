
var lib = require("./decode.js");
const fs = require('fs');
const http = require('http');
const https = require('https')

var rootMp3Url = "https://audio00.forvo.com/mp3/";

function getMp3Url(str) {
    var arr = str.split(",");
    if (arr.length > 1) {
        var code = arr[1].replace(/'/g, "");
        //console.log(code);

        var decode = lib.base64_decode(code);
        //console.log(decode);


        //var path ="http://audio00.forvo.com/mp3/8981864/39/8981864_39_3884_171273.mp3";
        var url = rootMp3Url + decode;
        //console.log(url);

        //download
        // var savePath = folder+"/" + word +".mp3";
        // const file = fs.createWriteStream(savePath);
        // const request = https.get(url, function (response) {
        //     console.log("download file done :" , savePath);
        //     response.pipe(file);
        // });

        //log file
        //console.log(word,  url);
        //log_file.write(word +"," + url +"\n");
        return url;
    }

    retun ;
}

function downloadFile(url , savePath){
    const file = fs.createWriteStream(savePath);
    const request = https.get(url, function (response) {
        console.log("download file done :" , savePath);
        response.pipe(file);
    });
}

function replaceSpecical(str, replacement){
    if(!str) return;
    return (str.replace(/[^a-zA-Z1-9]/g, replacement));
}

function getFileNameUrl(url){
    url = url.split('?')[0];
    url = url.split('#')[0];
    var filename = url.split('/').pop();
    return filename;
}

module.exports = {
    getMp3Url,
    downloadFile,
    getFileNameUrl,
    replaceSpecical
};