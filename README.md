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

## Dev

### Branch

- dev: Developer used
- main: release

## Release steps

After pushed the dev branch to origin

```sh
git checkout main
git pull -r
git tag v2.1.0
git push origin v2.1.0
```

Release a new version in github release page
