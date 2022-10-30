const algoliasearch = require('algoliasearch');
const fs = require('fs');
const { exit } = require('process');


const APPLICATION_ID = process.env.APPLICATION_ID;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const INDEX_NAME = process.env.INDEX_NAME;
const FILE_PATH = process.env.FILE_PATH;

if (!APPLICATION_ID && !ADMIN_API_KEY && !INDEX_NAME && !FILE_PATH) {
  exit();
}

const client = algoliasearch(APPLICATION_ID!, ADMIN_API_KEY!)
const index = client.initIndex(INDEX_NAME!)

try {
  console.log("Start to save Objects")
  const data = fs.readFileSync(FILE_PATH!, 'utf8')
  const objects = JSON.parse(data);
  index
    .saveObjects(objects, { autoGenerateObjectIDIfNotExist: true })
    .then(({ objectIDs }: {objectIDs: any}) => {
      console.log(objectIDs);
      console.log("Successfully saved Objects");
    });
} catch (err) {
  console.error(err)
}