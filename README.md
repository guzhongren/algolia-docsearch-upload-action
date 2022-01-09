# algolia-docsearch-upload-action

> An especially small & quick & simple Algolia docsearch Indices upload action

## Usage


```yaml
    - name: Algolia Docsearch Uploader
      uses: guzhongren/algolia-docsearch-upload-action@v1.0.0
      env:
        FILE_PATH: "./public/index.json"
        APPLICATION_ID: ${{secrets.ALGOLIA_APPLICATION_ID}}
        ADMIN_API_KEY: ${{secrets.ALGOLIA_API_KEY}}
        INDEX_NAME: "index.zh-cn"
```
