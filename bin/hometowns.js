#!/usr/bin/env node
var http = require('http');
var fs = require('fs');
var _ = require('underscore');

var imgurl = 'http://i1.nyt.com/projects/2013/lens-my-hometown/images/';

var options = {
    hostname: 'js.nyt.com',
    path: '/projects/2013/lens-my-hometown/data.jsonp',
    port: 80,
    method: 'GET'
};



function handleRequest(res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
        data += chunk;
    });
    res.on('end', function() {
        var lens = eval(data);
    });
}
function lensHometownData(res) {
    var photos = {};
    var names = {}; 
    var states = {};
    var edpicks = {};
    var template = '' +
    '<% _.each(data, function(photo) { %>' +
        '<div id="<%= photo.guid %>">' +
            '<h2><%= photo.town %>, <%= photo.state %></h2>' +
            '<img src="<% print("http://i1.nyt.com/projects/2013/lens-my-hometown/images/" + photo.photo_id + "-1024.jpg"); %>" alt="photo" />' +
            '<% if (photo.best_200) print("<p>Editors pick!</p>"); %>' +
            '<h3>Photo by <%= photo.name %>, <%= photo.age %></h3>' + 
            '<h3>School: <%= photo.school %></h3>' +
            '<p style="width: 500px;"><%= photo.caption %></p>' +
    '<% }); %>';
    photos.data = res.photos;
    photos.filtertype = 'photo';

    names.data = res.names;
    names.filtertype = 'name';

    states.data = res.states;
    states.filtertype = 'state';

    edpicks.data = [true];
    edpicks.filtertype = 'best_200';
    
    var mamk = {};
    mamk.data = _.filter(photos.data, function(photo) {
        return photo.school && photo.school.indexOf('Mamaroneck') > -1;
    });
    var body = _.template(template, mamk);
    var html = '<html><body>' + body + '</body></html>';
    fs.writeFile('index.html', html, function (err) {
        if(err) throw err;
    });
}

var req = http.request(options, handleRequest);

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

req.end();
