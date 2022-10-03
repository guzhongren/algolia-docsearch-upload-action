#!/bin/sh
set -eu

algolia profile add --name "my-profile" --app-id $APPLICATION_ID --admin-api-key $ADMIN_API_KEY --default

algolia objects import $INDEX_NAME -F $FILE_PATH
