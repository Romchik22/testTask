var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var networkName = "cnn";
var network = networkName + ".fyre.co";
var siteId = "353270";

app.get('/scrape', function(req, res) {

    var url = 'http://edition.cnn.com/2016/07/03/opinions/clinton-vp-list-opinion-julian-zelizer/index.html?iid=ob_lockedrail_bottomlist';
    var firstCount  = 1;
    var secondCount = 1;
    var tempExtraComm = "<p><a";
    var tempStartExtraComm = "</span></a>";
    var tempMainComm = "<span>";

   request(url, function(error, response, html){
        if (error) throw error;
        else {
            var $ = cheerio.load(html);

            $('.js-livefyre-comments').filter(function () {
                var dataArticleId = $(this).attr('data-article-id');
                var base64Id = new Buffer(dataArticleId.toString()).toString('base64');
                var livefureUrl = 'http://' + networkName + '.bootstrap.fyre.co/bs3/v3.1/' + network + '/' + siteId + '/' + base64Id + '/init';

                request(livefureUrl, function (error, response, body) {
                    if(error) throw error;
                    fs.writeFile('./file.json', body);
                });
            });


            fs.readFile('./file.json', 'utf8', function (err, file) {
                if (err) throw err;
                else {
                    if (file != "") {
                        JSON.parse(file, function (key, value) {
                            if (key == 'bodyHtml') {
                                if (value.indexOf(tempExtraComm) != 0) {
                                    var indexStart = 3;
                                    var indexEnd = 4;

                                    if (value.indexOf(tempMainComm) == 0) {
                                        indexStart = 6;
                                        indexEnd = 7;
                                    }

                                    console.log();
                                    console.log('Comment: ' + firstCount++ + '  ' + value.substring(indexStart, value.length - indexEnd));

                                    secondCount = 1;
                                } else {
                                    var start = 0;
                                    while (true) {
                                        var foundPos = value.indexOf(tempStartExtraComm, start);
                                        if (foundPos == -1) break;
                                        start = foundPos + 1;
                                    }

                                    console.log('   ' + 'CommentComment: ' + secondCount++ + '  ' + value.substring(start + 11, value.length - 4));
                                }

                            }
                        });
                    }
                }
            });
        }
       res.send('Check console');
    });

});

app.listen('8081');

console.log('Start! Port: 8081');

exports = module.exports = app;