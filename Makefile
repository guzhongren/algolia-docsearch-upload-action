test-docker:
	docker build -t algolia-docsearch-upload-action ./
	docker run algolia-docsearch-upload-action
