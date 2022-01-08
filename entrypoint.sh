#!/bin/sh
inpm install -g @algolia/cli

algolia import -s $FILE_PATH -a $APPLICATION_ID -k $ADMIN_API_KEY -n $INDEX_NAME 

if [ "$?" != "0" ] ; then
  echo "😢 Failed to upload your data to Algolia, PLZ report an issue, thx!"
  exit 1
fi

echo "🚀 Successfully uploaded!"
