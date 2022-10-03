# algolia-docsearch-upload-action

> An especially small & quick & simple Algolia docsearch Indices upload action

## Usage


```yaml
- name: Algolia Docsearch Uploader
  uses: guzhongren/algolia-docsearch-upload-action@v2.0.0
  env:
    FILE_PATH: "./public/index.json"
    APPLICATION_ID: ${{secrets.ALGOLIA_APPLICATION_ID}}
    ADMIN_API_KEY: ${{secrets.ALGOLIA_API_KEY}}
    INDEX_NAME: "index.zh-cn"
```

## local Dev

Put it at the top of `entrypoint.sh`

```shell
export APPLICATION_ID=APP_ID
export ADMIN_API_KEY=API_KEY
export INDEX_NAME="index.zh-cn"
export FILE_PATH="./test/data/index.json"
```
