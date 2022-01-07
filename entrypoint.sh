#!/bin/sh
npm install -g @algolia/cli

algolia import -s $FILE_PATH -a $APPLICATION_ID -k $ADMIN_API_KEY -n $INDEX_NAME 

echo "🚀 Successfully uploaded!"
