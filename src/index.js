"use strict";
exports.__esModule = true;
var algoliasearch_1 = require("algoliasearch");
var fs = require("fs");
var process_1 = require("process");
var APPLICATION_ID = process.env.APPLICATION_ID;
var ADMIN_API_KEY = process.env.ADMIN_API_KEY;
var INDEX_NAME = process.env.INDEX_NAME;
var FILE_PATH = process.env.FILE_PATH;
if (!APPLICATION_ID && !ADMIN_API_KEY && !INDEX_NAME && !FILE_PATH) {
    (0, process_1.exit)();
}
var client = (0, algoliasearch_1["default"])(APPLICATION_ID, ADMIN_API_KEY);
var index = client.initIndex(INDEX_NAME);
try {
    console.log("Start to save Objects");
    var data = fs.readFileSync(FILE_PATH, 'utf8');
    var objects = JSON.parse(data);
    index
        .saveObjects(objects, { autoGenerateObjectIDIfNotExist: true })
        .then(function (_a) {
        var objectIDs = _a.objectIDs;
        console.log(objectIDs);
        console.log("Successfully saved Objects");
    });
}
catch (err) {
    console.error(err);
}
