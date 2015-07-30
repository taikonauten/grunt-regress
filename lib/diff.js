var fs = require('fs');
var resemble = require('node-resemble-js');
var Promise = require('bluebird');

module.exports = function(file1, file2){

    return new Promise(function(resolve, reject){

        fs.exists(file1, rejectIfNotFound(reject));
        fs.exists(file2, rejectIfNotFound(reject));

        resemble(file1).compareTo(file2).onComplete(resolve);
    })
};


function rejectIfNotFound(reject){

    return function(exists){

        if(!exists) reject(new Error('FILE NOT FOUND '));
    }
}