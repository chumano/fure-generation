var Crawler = require("crawler");
const http = require('http');
const https = require('https')
const fs = require('fs');

var lib = require("./getmp3url.js");

var rootFolder = "data";

//https://forvo.com/guides/useful_phrases_in_english/

function queryWordInPage($,phrasefolder) {
    //console.log($(".main_section").text());
    var list = $(".phrase-content li.custom-play .phrase") || [];
    console.log("length", list.length);
    var log_file = fs.createWriteStream(phrasefolder + '/words.txt', {flags : 'w'});
    for (var i = 0; i < list.length; i++) {
        var ele = list[i];
        var word = $(ele).find(".word").text();
        var play = $(ele).find(".play").attr("onclick");
        //console.log(i, word, play);

        let mprurl = lib.getMp3Url(play);
        log_file.write(word +"," + mprurl +"\n");
    }
}
var crawlerWord = new Crawler({
    maxConnections: 1,
    rateLimit: 5000,
    // This will be called for each crawled page
    callback: function (error, res, done) {
       
    }
});

function crawlerPhraseFunc(url, name , desc , imgurl){
    //create folder
    var phrasefolder =rootFolder +"/phrase/" + name
    if (!fs.existsSync(phrasefolder)){
        fs.mkdirSync(phrasefolder);
    }
    //download img
    lib.downloadFile(imgurl,phrasefolder+"/img.png");

    crawlerWord.queue([{
        uri: url,
        // The global callback won't be called
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
                //try again
                setTimeout(function(){
                    crawlerPhraseFunc(url,name,desc, imgurl);
                },5000);
            } else {
                var $ = res.$;
                // $ is Cheerio by default
                queryWordInPage($ ,phrasefolder);
            }
            done();
        }
    }]);
}

function queryGroupInPage($) {
    //console.log($(".main_section").text());
    var selectors = ".bg_section a.item, .essential-content a.item"
    var list = $(selectors) || [];
    console.log("group length", list.length);
    for (var i = 0; i < list.length; i++) {
        var ele = list[i];
        
        var groupUrl = $(ele).attr("href");
        var titleDes=  $(ele).attr("title");

        var imgEle =  $(ele).find("img");
        var imgUrl = $(imgEle).attr("src");
        var name =  $(imgEle).attr("alt");
        
        console.log(i, name, titleDes , groupUrl , imgUrl);
        crawlerPhraseFunc(groupUrl, name, titleDes,imgUrl);
    }
}

var crawlerGroup = new Crawler({
    maxConnections: 1,
    rateLimit: 2000,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
            //try again
            setTimeout(function(){
                crawlerGroupFunc();
            },5000);
        } else {
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            //console.log($("title").text());
            queryGroupInPage($);
        }
        done();
    }
});

function crawlerGroupFunc(){
    crawlerGroup.queue("https://forvo.com/guides/useful_phrases_in_english/");
}

//https://forvo.com/guides/useful_phrases_in_english/
if (!fs.existsSync(rootFolder +"/phrase")){
    fs.mkdirSync(rootFolder +"/phrase");
}
crawlerGroupFunc();