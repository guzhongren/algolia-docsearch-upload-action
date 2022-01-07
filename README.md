# algolia-docsearch-action

## Usage


```yaml
    - name: Algolia Docsearch Uploader
      uses: guzhongren/algolia-docsearch-action@v0.1.0
      env:
	FILE_PATH: "./file/path/of/your/algolia/data.json"
        APPLICATION_ID: ${{secrets.ALGOLIA_APPLICATION_ID}}
        ADMIN_API_KEY: ${{secrets.ALGOLIA_ADMIN_API_KEY}}
        INDEX_NAME: "index.zh-cn"

```
