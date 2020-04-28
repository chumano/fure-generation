var Crawler = require("crawler");
const http = require('http');
const https = require('https')
const fs = require('fs');

var utils = require("./getmp3url");

var folder = "data/pronunciation1";
var str = "Play(175048,'ODk4MTg2NC8zOS84OTgxODY0XzM5XzM4ODRfMTcxMjczLm1wMw==','ODk4MTg2NC8zOS84OTgxODY0XzM5XzM4ODRfMTcxMjczLm9nZw==',false,'Mi95LzJ5Xzg5ODE4NjRfMzlfMzg4NF8xNzEyNzMubXAz','Mi95LzJ5Xzg5ODE4NjRfMzlfMzg4NF8xNzEyNzMub2dn','h');";
var log_file = undefined;//fs.createWriteStream(folder + '/words.txt', {flags : 'w'});

function queryWordInPage($) {
    //console.log($(".main_section").text());
    var li = $(".main_section >div").find("li") || [];
    console.log("length", li.length);
    for (var i = 0; i < li.length; i++) {
        var eli = li[i];
        var word = $(eli).find(".word").text();
        var play = $(eli).find("span").attr("onclick");
        console.log(i, word, play);

        var mp3url = utils.getMp3Url(play);
        log_file.write(word +"," + url +"\n");
    }
    //    li.forEach(element => {
    //        console.log(element.text());
    //    });
    return li.length > 0;
}
//=============================================
var isHaveData = true;
var isRequest = false;
var crawler = new Crawler({
    maxConnections: 1,
    rateLimit: 2000,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
            //try again
            setTimeout(function(){
                getDataPageRecurse(pageCount);
            },5000);
        } else {
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            //console.log($("title").text());
            isHaveData = queryWordInPage($);
            isRequest = false;
            if(isHaveData){
                setTimeout(function(){
                    getDataPageRecurse(pageCount);
                },1000);
            }
        }
        done();
    }
});



const urlFormat = "https://forvo.com/languages-pronunciations/en/page-";
var pageCount =1;
function getDataPageRecurse(pageC){
    var page = urlFormat + pageC;
    log_file = fs.createWriteStream(folder + '/words'+ pageC +'.txt', {flags : 'w'});
    // Queue just one URL, with default callback
    console.log("-------------",page);
    isRequest = true;
    crawler.queue(page);
    pageCount++;
}


getDataPageRecurse(pageCount);

