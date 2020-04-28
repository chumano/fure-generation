var Crawler = require("crawler");
const http = require('http');
const https = require('https')
const fs = require('fs');
const lineReader = require('line-reader');
var path = require('path');

var utils = require("./getmp3url");

let crawler = new Crawler({
    maxConnections: 2,
    rateLimit: 1000,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            console.log("downloaded", res.options.filename)
            fs.createWriteStream(res.options.filename).write(res.body);
        }
        done();
    }
});

//=======================
//read data files :  word,mp3url
function readFile(path, func, donFunc) {
    lineReader.eachLine(path, function (line, last) {

        var arr = line.split(",");
        if (arr.length == 2) {
            var word = arr[0];
            var url = arr[1]
            func(word, url);
        }

        if (last)
            donFunc();

    });
}


function loopFile(fileList, index) {
    if (index == fileList.length) return;
    //================================
    var fileInfo = fileList[index];
    var fileFolder = fileInfo.output;

    var mp3Folder = fileFolder + "/mp3";
    if (!fs.existsSync(mp3Folder)) {
        fs.mkdirSync(mp3Folder);
    }

    var datafile = fileFolder + '/data.txt';
    var log_file = fs.createWriteStream(datafile, { flags: 'w' });

    //==========================
    var listData = [];
    readFile(fileInfo.file, function (word, url) {
        listData.push({ word: word, url: url });

    }, function () { //done
        console.log("readFile:", fileInfo.file, ", words :", listData.length);
        //loop
        for (var i = 0; i < listData.length; i++) {
            var data = listData[i];
            var filename = utils.replaceSpecical(data.word, "_").toLowerCase() + ".mp3";
            //console.log(word , ":",  filename);
            log_file.write(data.word + "," + filename + "\n");
            crawler.queue({
                uri: data.url,
                filename: mp3Folder + "/" + filename,
                encoding: null,
                jQuery: false
            });
            //utils.downloadFile(data.url, mp3Folder+ "/"+filename);
        }

        //===================
        //next
        loopFile(fileList, index + 1);
    });


}


function getPronunciation() {
    var num = 20;
    var inputFolder = "./data/pronunciation";
    var rs = [];
    for (var i = 3; i <= num; i++) {
        var filename = "words" + (i);
        var outputFolder = inputFolder + "/" + filename;
        //=================================
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }

        rs.push({
            file: inputFolder + "/" + filename + ".txt",
            output: outputFolder
        });
    }
    return rs;
}

function getPhrase() {
    var inputFolder = "./data/phrase";
    //get folders 
    const getDirectories = source =>
        fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() ) 
            .map(dirent => dirent.name);
    var listFolder = getDirectories(inputFolder);
    var rs =[];
    for (var i = 0; i < listFolder.length; i++) {
        var foldername = listFolder[i];
        var folder = inputFolder + "/" + foldername;
        var file = folder +"/"+"words.txt";
        var outputFolder =folder;
        rs.push({
            file: file,
            output: outputFolder
        });
    }
    return rs;
}
function run() {
    //var fileList = getPronunciation();
    var fileList = getPhrase();
    console.log(fileList);
    var startIndex = 0;
    loopFile(fileList, startIndex);

}

run();
