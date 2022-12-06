/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 892:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

// @todo Add logger on options to debug when caches go wrong.
function createFallbackableCache(options) {
    const caches = [...options.caches];
    const current = caches.shift(); // eslint-disable-line functional/immutable-data
    if (current === undefined) {
        return createNullCache();
    }
    return {
        get(key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            return current.get(key, defaultValue, events).catch(() => {
                return createFallbackableCache({ caches }).get(key, defaultValue, events);
            });
        },
        set(key, value) {
            return current.set(key, value).catch(() => {
                return createFallbackableCache({ caches }).set(key, value);
            });
        },
        delete(key) {
            return current.delete(key).catch(() => {
                return createFallbackableCache({ caches }).delete(key);
            });
        },
        clear() {
            return current.clear().catch(() => {
                return createFallbackableCache({ caches }).clear();
            });
        },
    };
}

function createNullCache() {
    return {
        get(_key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            const value = defaultValue();
            return value
                .then(result => Promise.all([result, events.miss(result)]))
                .then(([result]) => result);
        },
        set(_key, value) {
            return Promise.resolve(value);
        },
        delete(_key) {
            return Promise.resolve();
        },
        clear() {
            return Promise.resolve();
        },
    };
}

exports.createFallbackableCache = createFallbackableCache;
exports.createNullCache = createNullCache;


/***/ }),

/***/ 17:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(892);


/***/ }),

/***/ 61:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function createInMemoryCache(options = { serializable: true }) {
    // eslint-disable-next-line functional/no-let
    let cache = {};
    return {
        get(key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            const keyAsString = JSON.stringify(key);
            if (keyAsString in cache) {
                return Promise.resolve(options.serializable ? JSON.parse(cache[keyAsString]) : cache[keyAsString]);
            }
            const promise = defaultValue();
            const miss = (events && events.miss) || (() => Promise.resolve());
            return promise.then((value) => miss(value)).then(() => promise);
        },
        set(key, value) {
            // eslint-disable-next-line functional/immutable-data
            cache[JSON.stringify(key)] = options.serializable ? JSON.stringify(value) : value;
            return Promise.resolve(value);
        },
        delete(key) {
            // eslint-disable-next-line functional/immutable-data
            delete cache[JSON.stringify(key)];
            return Promise.resolve();
        },
        clear() {
            cache = {};
            return Promise.resolve();
        },
    };
}

exports.createInMemoryCache = createInMemoryCache;


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(61);


/***/ }),

/***/ 567:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var clientCommon = __nccwpck_require__(201);
var transporter = __nccwpck_require__(739);
var requesterCommon = __nccwpck_require__(289);

const createAnalyticsClient = options => {
    const region = options.region || 'us';
    const auth = clientCommon.createAuth(clientCommon.AuthMode.WithinHeaders, options.appId, options.apiKey);
    const transporter$1 = transporter.createTransporter({
        hosts: [{ url: `analytics.${region}.algolia.com` }],
        ...options,
        headers: {
            ...auth.headers(),
            ...{ 'content-type': 'application/json' },
            ...options.headers,
        },
        queryParameters: {
            ...auth.queryParameters(),
            ...options.queryParameters,
        },
    });
    const appId = options.appId;
    return clientCommon.addMethods({ appId, transporter: transporter$1 }, options.methods);
};

const addABTest = (base) => {
    return (abTest, requestOptions) => {
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '2/abtests',
            data: abTest,
        }, requestOptions);
    };
};

const deleteABTest = (base) => {
    return (abTestID, requestOptions) => {
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: clientCommon.encode('2/abtests/%s', abTestID),
        }, requestOptions);
    };
};

const getABTest = (base) => {
    return (abTestID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('2/abtests/%s', abTestID),
        }, requestOptions);
    };
};

const getABTests = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '2/abtests',
        }, requestOptions);
    };
};

const stopABTest = (base) => {
    return (abTestID, requestOptions) => {
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('2/abtests/%s/stop', abTestID),
        }, requestOptions);
    };
};

exports.addABTest = addABTest;
exports.createAnalyticsClient = createAnalyticsClient;
exports.deleteABTest = deleteABTest;
exports.getABTest = getABTest;
exports.getABTests = getABTests;
exports.stopABTest = stopABTest;


/***/ }),

/***/ 591:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(567);


/***/ }),

/***/ 586:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function createAuth(authMode, appId, apiKey) {
    const credentials = {
        'x-algolia-api-key': apiKey,
        'x-algolia-application-id': appId,
    };
    return {
        headers() {
            return authMode === AuthMode.WithinHeaders ? credentials : {};
        },
        queryParameters() {
            return authMode === AuthMode.WithinQueryParameters ? credentials : {};
        },
    };
}

function createRetryablePromise(callback) {
    let retriesCount = 0; // eslint-disable-line functional/no-let
    const retry = () => {
        retriesCount++;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(callback(retry));
            }, Math.min(100 * retriesCount, 1000));
        });
    };
    return callback(retry);
}

function createWaitablePromise(promise, wait = (_response, _requestOptions) => {
    return Promise.resolve();
}) {
    // eslint-disable-next-line functional/immutable-data
    return Object.assign(promise, {
        wait(requestOptions) {
            return createWaitablePromise(promise
                .then(response => Promise.all([wait(response, requestOptions), response]))
                .then(promiseResults => promiseResults[1]));
        },
    });
}

// eslint-disable-next-line functional/prefer-readonly-type
function shuffle(array) {
    let c = array.length - 1; // eslint-disable-line functional/no-let
    // eslint-disable-next-line functional/no-loop-statement
    for (c; c > 0; c--) {
        const b = Math.floor(Math.random() * (c + 1));
        const a = array[c];
        array[c] = array[b]; // eslint-disable-line functional/immutable-data, no-param-reassign
        array[b] = a; // eslint-disable-line functional/immutable-data, no-param-reassign
    }
    return array;
}
function addMethods(base, methods) {
    if (!methods) {
        return base;
    }
    Object.keys(methods).forEach(key => {
        // eslint-disable-next-line functional/immutable-data, no-param-reassign
        base[key] = methods[key](base);
    });
    return base;
}
function encode(format, ...args) {
    // eslint-disable-next-line functional/no-let
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}

const version = '4.14.2';

const destroy = (base) => {
    return () => {
        return base.transporter.requester.destroy();
    };
};

const AuthMode = {
    /**
     * If auth credentials should be in query parameters.
     */
    WithinQueryParameters: 0,
    /**
     * If auth credentials should be in headers.
     */
    WithinHeaders: 1,
};

exports.AuthMode = AuthMode;
exports.addMethods = addMethods;
exports.createAuth = createAuth;
exports.createRetryablePromise = createRetryablePromise;
exports.createWaitablePromise = createWaitablePromise;
exports.destroy = destroy;
exports.encode = encode;
exports.shuffle = shuffle;
exports.version = version;


/***/ }),

/***/ 201:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(586);


/***/ }),

/***/ 942:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var clientCommon = __nccwpck_require__(201);
var transporter = __nccwpck_require__(739);
var requesterCommon = __nccwpck_require__(289);

const createPersonalizationClient = options => {
    const region = options.region || 'us';
    const auth = clientCommon.createAuth(clientCommon.AuthMode.WithinHeaders, options.appId, options.apiKey);
    const transporter$1 = transporter.createTransporter({
        hosts: [{ url: `personalization.${region}.algolia.com` }],
        ...options,
        headers: {
            ...auth.headers(),
            ...{ 'content-type': 'application/json' },
            ...options.headers,
        },
        queryParameters: {
            ...auth.queryParameters(),
            ...options.queryParameters,
        },
    });
    return clientCommon.addMethods({ appId: options.appId, transporter: transporter$1 }, options.methods);
};

const getPersonalizationStrategy = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/strategies/personalization',
        }, requestOptions);
    };
};

const setPersonalizationStrategy = (base) => {
    return (personalizationStrategy, requestOptions) => {
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '1/strategies/personalization',
            data: personalizationStrategy,
        }, requestOptions);
    };
};

exports.createPersonalizationClient = createPersonalizationClient;
exports.getPersonalizationStrategy = getPersonalizationStrategy;
exports.setPersonalizationStrategy = setPersonalizationStrategy;


/***/ }),

/***/ 830:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(942);


/***/ }),

/***/ 1:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var clientCommon = __nccwpck_require__(201);
var transporter = __nccwpck_require__(739);
var requesterCommon = __nccwpck_require__(289);
var crypto = __nccwpck_require__(113);

function createBrowsablePromise(options) {
    const browse = (data) => {
        return options.request(data).then(response => {
            /**
             * First we send to the developer the
             * batch retrieved from the API.
             */
            if (options.batch !== undefined) {
                options.batch(response.hits);
            }
            /**
             * Then, we ask to the browse concrete implementation
             * if we should stop browsing. As example, the `browseObjects`
             * method will stop if the cursor is not present on the response.
             */
            if (options.shouldStop(response)) {
                return undefined;
            }
            /**
             * Finally, if the response contains a cursor, we browse to the next
             * batch using that same cursor. Otherwise, we just use the traditional
             * browsing using the page element.
             */
            if (response.cursor) {
                return browse({
                    cursor: response.cursor,
                });
            }
            return browse({
                page: (data.page || 0) + 1,
            });
        });
    };
    return browse({});
}

const createSearchClient = options => {
    const appId = options.appId;
    const auth = clientCommon.createAuth(options.authMode !== undefined ? options.authMode : clientCommon.AuthMode.WithinHeaders, appId, options.apiKey);
    const transporter$1 = transporter.createTransporter({
        hosts: [
            { url: `${appId}-dsn.algolia.net`, accept: transporter.CallEnum.Read },
            { url: `${appId}.algolia.net`, accept: transporter.CallEnum.Write },
        ].concat(clientCommon.shuffle([
            { url: `${appId}-1.algolianet.com` },
            { url: `${appId}-2.algolianet.com` },
            { url: `${appId}-3.algolianet.com` },
        ])),
        ...options,
        headers: {
            ...auth.headers(),
            ...{ 'content-type': 'application/x-www-form-urlencoded' },
            ...options.headers,
        },
        queryParameters: {
            ...auth.queryParameters(),
            ...options.queryParameters,
        },
    });
    const base = {
        transporter: transporter$1,
        appId,
        addAlgoliaAgent(segment, version) {
            transporter$1.userAgent.add({ segment, version });
        },
        clearCache() {
            return Promise.all([
                transporter$1.requestsCache.clear(),
                transporter$1.responsesCache.clear(),
            ]).then(() => undefined);
        },
    };
    return clientCommon.addMethods(base, options.methods);
};

function createMissingObjectIDError() {
    return {
        name: 'MissingObjectIDError',
        message: 'All objects must have an unique objectID ' +
            '(like a primary key) to be valid. ' +
            'Algolia is also able to generate objectIDs ' +
            "automatically but *it's not recommended*. " +
            "To do it, use the `{'autoGenerateObjectIDIfNotExist': true}` option.",
    };
}

function createObjectNotFoundError() {
    return {
        name: 'ObjectNotFoundError',
        message: 'Object not found.',
    };
}

function createValidUntilNotFoundError() {
    return {
        name: 'ValidUntilNotFoundError',
        message: 'ValidUntil not found in given secured api key.',
    };
}

const addApiKey = (base) => {
    return (acl, requestOptions) => {
        const { queryParameters, ...options } = requestOptions || {};
        const data = {
            acl,
            ...(queryParameters !== undefined ? { queryParameters } : {}),
        };
        const wait = (response, waitRequestOptions) => {
            return clientCommon.createRetryablePromise(retry => {
                return getApiKey(base)(response.key, waitRequestOptions).catch((apiError) => {
                    if (apiError.status !== 404) {
                        throw apiError;
                    }
                    return retry();
                });
            });
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '1/keys',
            data,
        }, options), wait);
    };
};

const assignUserID = (base) => {
    return (userID, clusterName, requestOptions) => {
        const mappedRequestOptions = transporter.createMappedRequestOptions(requestOptions);
        // eslint-disable-next-line functional/immutable-data
        mappedRequestOptions.queryParameters['X-Algolia-User-ID'] = userID;
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '1/clusters/mapping',
            data: { cluster: clusterName },
        }, mappedRequestOptions);
    };
};

const assignUserIDs = (base) => {
    return (userIDs, clusterName, requestOptions) => {
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '1/clusters/mapping/batch',
            data: {
                users: userIDs,
                cluster: clusterName,
            },
        }, requestOptions);
    };
};

const clearDictionaryEntries = (base) => {
    return (dictionary, requestOptions) => {
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('/1/dictionaries/%s/batch', dictionary),
            data: {
                clearExistingDictionaryEntries: true,
                requests: { action: 'addEntry', body: [] },
            },
        }, requestOptions), (response, waitRequestOptions) => waitAppTask(base)(response.taskID, waitRequestOptions));
    };
};

const copyIndex = (base) => {
    return (from, to, requestOptions) => {
        const wait = (response, waitRequestOptions) => {
            return initIndex(base)(from, {
                methods: { waitTask },
            }).waitTask(response.taskID, waitRequestOptions);
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/operation', from),
            data: {
                operation: 'copy',
                destination: to,
            },
        }, requestOptions), wait);
    };
};

const copyRules = (base) => {
    return (from, to, requestOptions) => {
        return copyIndex(base)(from, to, {
            ...requestOptions,
            scope: [ScopeEnum.Rules],
        });
    };
};

const copySettings = (base) => {
    return (from, to, requestOptions) => {
        return copyIndex(base)(from, to, {
            ...requestOptions,
            scope: [ScopeEnum.Settings],
        });
    };
};

const copySynonyms = (base) => {
    return (from, to, requestOptions) => {
        return copyIndex(base)(from, to, {
            ...requestOptions,
            scope: [ScopeEnum.Synonyms],
        });
    };
};

const customRequest = (base) => {
    return (request, requestOptions) => {
        if (request.method === requesterCommon.MethodEnum.Get) {
            return base.transporter.read(request, requestOptions);
        }
        return base.transporter.write(request, requestOptions);
    };
};

const deleteApiKey = (base) => {
    return (apiKey, requestOptions) => {
        const wait = (_, waitRequestOptions) => {
            return clientCommon.createRetryablePromise(retry => {
                return getApiKey(base)(apiKey, waitRequestOptions)
                    .then(retry)
                    .catch((apiError) => {
                    if (apiError.status !== 404) {
                        throw apiError;
                    }
                });
            });
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: clientCommon.encode('1/keys/%s', apiKey),
        }, requestOptions), wait);
    };
};

const deleteDictionaryEntries = (base) => {
    return (dictionary, objectIDs, requestOptions) => {
        const requests = objectIDs.map(objectID => ({
            action: 'deleteEntry',
            body: { objectID },
        }));
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('/1/dictionaries/%s/batch', dictionary),
            data: { clearExistingDictionaryEntries: false, requests },
        }, requestOptions), (response, waitRequestOptions) => waitAppTask(base)(response.taskID, waitRequestOptions));
    };
};

const generateSecuredApiKey = () => {
    return (parentApiKey, restrictions) => {
        const queryParameters = transporter.serializeQueryParameters(restrictions);
        const securedKey = crypto.createHmac('sha256', parentApiKey)
            .update(queryParameters)
            .digest('hex');
        return Buffer.from(securedKey + queryParameters).toString('base64');
    };
};

const getApiKey = (base) => {
    return (apiKey, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/keys/%s', apiKey),
        }, requestOptions);
    };
};

const getAppTask = (base) => {
    return (taskID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/task/%s', taskID.toString()),
        }, requestOptions);
    };
};

const getDictionarySettings = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '/1/dictionaries/*/settings',
        }, requestOptions);
    };
};

const getLogs = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/logs',
        }, requestOptions);
    };
};

const getSecuredApiKeyRemainingValidity = () => {
    return (securedApiKey) => {
        const decodedString = Buffer.from(securedApiKey, 'base64').toString('ascii');
        const regex = /validUntil=(\d+)/;
        const match = decodedString.match(regex);
        if (match === null) {
            throw createValidUntilNotFoundError();
        }
        return parseInt(match[1], 10) - Math.round(new Date().getTime() / 1000);
    };
};

const getTopUserIDs = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/clusters/mapping/top',
        }, requestOptions);
    };
};

const getUserID = (base) => {
    return (userID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/clusters/mapping/%s', userID),
        }, requestOptions);
    };
};

const hasPendingMappings = (base) => {
    return (requestOptions) => {
        const { retrieveMappings, ...options } = requestOptions || {};
        if (retrieveMappings === true) {
            // eslint-disable-next-line functional/immutable-data
            options.getClusters = true;
        }
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/clusters/mapping/pending',
        }, options);
    };
};

const initIndex = (base) => {
    return (indexName, options = {}) => {
        const searchIndex = {
            transporter: base.transporter,
            appId: base.appId,
            indexName,
        };
        return clientCommon.addMethods(searchIndex, options.methods);
    };
};

const listApiKeys = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/keys',
        }, requestOptions);
    };
};

const listClusters = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/clusters',
        }, requestOptions);
    };
};

const listIndices = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/indexes',
        }, requestOptions);
    };
};

const listUserIDs = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: '1/clusters/mapping',
        }, requestOptions);
    };
};

const moveIndex = (base) => {
    return (from, to, requestOptions) => {
        const wait = (response, waitRequestOptions) => {
            return initIndex(base)(from, {
                methods: { waitTask },
            }).waitTask(response.taskID, waitRequestOptions);
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/operation', from),
            data: {
                operation: 'move',
                destination: to,
            },
        }, requestOptions), wait);
    };
};

const multipleBatch = (base) => {
    return (requests, requestOptions) => {
        const wait = (response, waitRequestOptions) => {
            return Promise.all(Object.keys(response.taskID).map(indexName => {
                return initIndex(base)(indexName, {
                    methods: { waitTask },
                }).waitTask(response.taskID[indexName], waitRequestOptions);
            }));
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: '1/indexes/*/batch',
            data: {
                requests,
            },
        }, requestOptions), wait);
    };
};

const multipleGetObjects = (base) => {
    return (requests, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: '1/indexes/*/objects',
            data: {
                requests,
            },
        }, requestOptions);
    };
};

const multipleQueries = (base) => {
    return (queries, requestOptions) => {
        const requests = queries.map(query => {
            return {
                ...query,
                params: transporter.serializeQueryParameters(query.params || {}),
            };
        });
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: '1/indexes/*/queries',
            data: {
                requests,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const multipleSearchForFacetValues = (base) => {
    return (queries, requestOptions) => {
        return Promise.all(queries.map(query => {
            const { facetName, facetQuery, ...params } = query.params;
            return initIndex(base)(query.indexName, {
                methods: { searchForFacetValues },
            }).searchForFacetValues(facetName, facetQuery, {
                ...requestOptions,
                ...params,
            });
        }));
    };
};

const removeUserID = (base) => {
    return (userID, requestOptions) => {
        const mappedRequestOptions = transporter.createMappedRequestOptions(requestOptions);
        // eslint-disable-next-line functional/immutable-data
        mappedRequestOptions.queryParameters['X-Algolia-User-ID'] = userID;
        return base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: '1/clusters/mapping',
        }, mappedRequestOptions);
    };
};

const replaceDictionaryEntries = (base) => {
    return (dictionary, entries, requestOptions) => {
        const requests = entries.map(entry => ({
            action: 'addEntry',
            body: entry,
        }));
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('/1/dictionaries/%s/batch', dictionary),
            data: { clearExistingDictionaryEntries: true, requests },
        }, requestOptions), (response, waitRequestOptions) => waitAppTask(base)(response.taskID, waitRequestOptions));
    };
};

const restoreApiKey = (base) => {
    return (apiKey, requestOptions) => {
        const wait = (_, waitRequestOptions) => {
            return clientCommon.createRetryablePromise(retry => {
                return getApiKey(base)(apiKey, waitRequestOptions).catch((apiError) => {
                    if (apiError.status !== 404) {
                        throw apiError;
                    }
                    return retry();
                });
            });
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/keys/%s/restore', apiKey),
        }, requestOptions), wait);
    };
};

const saveDictionaryEntries = (base) => {
    return (dictionary, entries, requestOptions) => {
        const requests = entries.map(entry => ({
            action: 'addEntry',
            body: entry,
        }));
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('/1/dictionaries/%s/batch', dictionary),
            data: { clearExistingDictionaryEntries: false, requests },
        }, requestOptions), (response, waitRequestOptions) => waitAppTask(base)(response.taskID, waitRequestOptions));
    };
};

const searchDictionaryEntries = (base) => {
    return (dictionary, query, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('/1/dictionaries/%s/search', dictionary),
            data: {
                query,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const searchUserIDs = (base) => {
    return (query, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: '1/clusters/mapping/search',
            data: {
                query,
            },
        }, requestOptions);
    };
};

const setDictionarySettings = (base) => {
    return (settings, requestOptions) => {
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Put,
            path: '/1/dictionaries/*/settings',
            data: settings,
        }, requestOptions), (response, waitRequestOptions) => waitAppTask(base)(response.taskID, waitRequestOptions));
    };
};

const updateApiKey = (base) => {
    return (apiKey, requestOptions) => {
        const updatedFields = Object.assign({}, requestOptions);
        const { queryParameters, ...options } = requestOptions || {};
        const data = queryParameters ? { queryParameters } : {};
        const apiKeyFields = [
            'acl',
            'indexes',
            'referers',
            'restrictSources',
            'queryParameters',
            'description',
            'maxQueriesPerIPPerHour',
            'maxHitsPerQuery',
        ];
        const hasChanged = (getApiKeyResponse) => {
            return Object.keys(updatedFields)
                .filter((updatedField) => apiKeyFields.indexOf(updatedField) !== -1)
                .every(updatedField => {
                return getApiKeyResponse[updatedField] === updatedFields[updatedField];
            });
        };
        const wait = (_, waitRequestOptions) => clientCommon.createRetryablePromise(retry => {
            return getApiKey(base)(apiKey, waitRequestOptions).then(getApiKeyResponse => {
                return hasChanged(getApiKeyResponse) ? Promise.resolve() : retry();
            });
        });
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Put,
            path: clientCommon.encode('1/keys/%s', apiKey),
            data,
        }, options), wait);
    };
};

const waitAppTask = (base) => {
    return (taskID, requestOptions) => {
        return clientCommon.createRetryablePromise(retry => {
            return getAppTask(base)(taskID, requestOptions).then(response => {
                return response.status !== 'published' ? retry() : undefined;
            });
        });
    };
};

const batch = (base) => {
    return (requests, requestOptions) => {
        const wait = (response, waitRequestOptions) => {
            return waitTask(base)(response.taskID, waitRequestOptions);
        };
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/batch', base.indexName),
            data: {
                requests,
            },
        }, requestOptions), wait);
    };
};

const browseObjects = (base) => {
    return (requestOptions) => {
        return createBrowsablePromise({
            shouldStop: response => response.cursor === undefined,
            ...requestOptions,
            request: (data) => base.transporter.read({
                method: requesterCommon.MethodEnum.Post,
                path: clientCommon.encode('1/indexes/%s/browse', base.indexName),
                data,
            }, requestOptions),
        });
    };
};

const browseRules = (base) => {
    return (requestOptions) => {
        const options = {
            hitsPerPage: 1000,
            ...requestOptions,
        };
        return createBrowsablePromise({
            shouldStop: response => response.hits.length < options.hitsPerPage,
            ...options,
            request(data) {
                return searchRules(base)('', { ...options, ...data }).then((response) => {
                    return {
                        ...response,
                        hits: response.hits.map(rule => {
                            // eslint-disable-next-line functional/immutable-data,no-param-reassign
                            delete rule._highlightResult;
                            return rule;
                        }),
                    };
                });
            },
        });
    };
};

const browseSynonyms = (base) => {
    return (requestOptions) => {
        const options = {
            hitsPerPage: 1000,
            ...requestOptions,
        };
        return createBrowsablePromise({
            shouldStop: response => response.hits.length < options.hitsPerPage,
            ...options,
            request(data) {
                return searchSynonyms(base)('', { ...options, ...data }).then((response) => {
                    return {
                        ...response,
                        hits: response.hits.map(synonym => {
                            // eslint-disable-next-line functional/immutable-data,no-param-reassign
                            delete synonym._highlightResult;
                            return synonym;
                        }),
                    };
                });
            },
        });
    };
};

const chunkedBatch = (base) => {
    return (bodies, action, requestOptions) => {
        const { batchSize, ...options } = requestOptions || {};
        const response = {
            taskIDs: [],
            objectIDs: [],
        };
        const forEachBatch = (lastIndex = 0) => {
            // eslint-disable-next-line functional/prefer-readonly-type
            const bodiesChunk = [];
            // eslint-disable-next-line functional/no-let
            let index;
            /* eslint-disable-next-line functional/no-loop-statement */
            for (index = lastIndex; index < bodies.length; index++) {
                // eslint-disable-next-line functional/immutable-data
                bodiesChunk.push(bodies[index]);
                if (bodiesChunk.length === (batchSize || 1000)) {
                    break;
                }
            }
            if (bodiesChunk.length === 0) {
                return Promise.resolve(response);
            }
            return batch(base)(bodiesChunk.map(body => {
                return {
                    action,
                    body,
                };
            }), options).then(res => {
                response.objectIDs = response.objectIDs.concat(res.objectIDs); // eslint-disable-line functional/immutable-data
                response.taskIDs.push(res.taskID); // eslint-disable-line functional/immutable-data
                index++;
                return forEachBatch(index);
            });
        };
        return clientCommon.createWaitablePromise(forEachBatch(), (chunkedBatchResponse, waitRequestOptions) => {
            return Promise.all(chunkedBatchResponse.taskIDs.map(taskID => {
                return waitTask(base)(taskID, waitRequestOptions);
            }));
        });
    };
};

const clearObjects = (base) => {
    return (requestOptions) => {
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/clear', base.indexName),
        }, requestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const clearRules = (base) => {
    return (requestOptions) => {
        const { forwardToReplicas, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/rules/clear', base.indexName),
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const clearSynonyms = (base) => {
    return (requestOptions) => {
        const { forwardToReplicas, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/synonyms/clear', base.indexName),
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const deleteBy = (base) => {
    return (filters, requestOptions) => {
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/deleteByQuery', base.indexName),
            data: filters,
        }, requestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const deleteIndex = (base) => {
    return (requestOptions) => {
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: clientCommon.encode('1/indexes/%s', base.indexName),
        }, requestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const deleteObject = (base) => {
    return (objectID, requestOptions) => {
        return clientCommon.createWaitablePromise(deleteObjects(base)([objectID], requestOptions).then(response => {
            return { taskID: response.taskIDs[0] };
        }), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const deleteObjects = (base) => {
    return (objectIDs, requestOptions) => {
        const objects = objectIDs.map(objectID => {
            return { objectID };
        });
        return chunkedBatch(base)(objects, BatchActionEnum.DeleteObject, requestOptions);
    };
};

const deleteRule = (base) => {
    return (objectID, requestOptions) => {
        const { forwardToReplicas, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: clientCommon.encode('1/indexes/%s/rules/%s', base.indexName, objectID),
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const deleteSynonym = (base) => {
    return (objectID, requestOptions) => {
        const { forwardToReplicas, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Delete,
            path: clientCommon.encode('1/indexes/%s/synonyms/%s', base.indexName, objectID),
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const exists = (base) => {
    return (requestOptions) => {
        return getSettings(base)(requestOptions)
            .then(() => true)
            .catch(error => {
            if (error.status !== 404) {
                throw error;
            }
            return false;
        });
    };
};

const findAnswers = (base) => {
    return (query, queryLanguages, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/answers/%s/prediction', base.indexName),
            data: {
                query,
                queryLanguages,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const findObject = (base) => {
    return (callback, requestOptions) => {
        const { query, paginate, ...options } = requestOptions || {};
        // eslint-disable-next-line functional/no-let
        let page = 0;
        const forEachPage = () => {
            return search(base)(query || '', { ...options, page }).then(result => {
                // eslint-disable-next-line functional/no-loop-statement
                for (const [position, hit] of Object.entries(result.hits)) {
                    // eslint-disable-next-line promise/no-callback-in-promise
                    if (callback(hit)) {
                        return {
                            object: hit,
                            position: parseInt(position, 10),
                            page,
                        };
                    }
                }
                page++;
                // paginate if option was set and has next page
                if (paginate === false || page >= result.nbPages) {
                    throw createObjectNotFoundError();
                }
                return forEachPage();
            });
        };
        return forEachPage();
    };
};

const getObject = (base) => {
    return (objectID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/indexes/%s/%s', base.indexName, objectID),
        }, requestOptions);
    };
};

const getObjectPosition = () => {
    return (searchResponse, objectID) => {
        // eslint-disable-next-line functional/no-loop-statement
        for (const [position, hit] of Object.entries(searchResponse.hits)) {
            if (hit.objectID === objectID) {
                return parseInt(position, 10);
            }
        }
        return -1;
    };
};

const getObjects = (base) => {
    return (objectIDs, requestOptions) => {
        const { attributesToRetrieve, ...options } = requestOptions || {};
        const requests = objectIDs.map(objectID => {
            return {
                indexName: base.indexName,
                objectID,
                ...(attributesToRetrieve ? { attributesToRetrieve } : {}),
            };
        });
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: '1/indexes/*/objects',
            data: {
                requests,
            },
        }, options);
    };
};

const getRule = (base) => {
    return (objectID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/indexes/%s/rules/%s', base.indexName, objectID),
        }, requestOptions);
    };
};

const getSettings = (base) => {
    return (requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/indexes/%s/settings', base.indexName),
            data: {
                getVersion: 2,
            },
        }, requestOptions);
    };
};

const getSynonym = (base) => {
    return (objectID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode(`1/indexes/%s/synonyms/%s`, base.indexName, objectID),
        }, requestOptions);
    };
};

const getTask = (base) => {
    return (taskID, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Get,
            path: clientCommon.encode('1/indexes/%s/task/%s', base.indexName, taskID.toString()),
        }, requestOptions);
    };
};

const partialUpdateObject = (base) => {
    return (object, requestOptions) => {
        return clientCommon.createWaitablePromise(partialUpdateObjects(base)([object], requestOptions).then(response => {
            return {
                objectID: response.objectIDs[0],
                taskID: response.taskIDs[0],
            };
        }), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const partialUpdateObjects = (base) => {
    return (objects, requestOptions) => {
        const { createIfNotExists, ...options } = requestOptions || {};
        const action = createIfNotExists
            ? BatchActionEnum.PartialUpdateObject
            : BatchActionEnum.PartialUpdateObjectNoCreate;
        return chunkedBatch(base)(objects, action, options);
    };
};

const replaceAllObjects = (base) => {
    return (objects, requestOptions) => {
        const { safe, autoGenerateObjectIDIfNotExist, batchSize, ...options } = requestOptions || {};
        const operation = (from, to, type, operationRequestOptions) => {
            return clientCommon.createWaitablePromise(base.transporter.write({
                method: requesterCommon.MethodEnum.Post,
                path: clientCommon.encode('1/indexes/%s/operation', from),
                data: {
                    operation: type,
                    destination: to,
                },
            }, operationRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
        };
        const randomSuffix = Math.random()
            .toString(36)
            .substring(7);
        const temporaryIndexName = `${base.indexName}_tmp_${randomSuffix}`;
        const saveObjectsInTemporary = saveObjects({
            appId: base.appId,
            transporter: base.transporter,
            indexName: temporaryIndexName,
        });
        // @ts-ignore
        // eslint-disable-next-line prefer-const, functional/no-let, functional/prefer-readonly-type
        let responses = [];
        const copyWaitablePromise = operation(base.indexName, temporaryIndexName, 'copy', {
            ...options,
            scope: ['settings', 'synonyms', 'rules'],
        });
        // eslint-disable-next-line functional/immutable-data
        responses.push(copyWaitablePromise);
        const result = (safe
            ? copyWaitablePromise.wait(options)
            : copyWaitablePromise)
            .then(() => {
            const saveObjectsWaitablePromise = saveObjectsInTemporary(objects, {
                ...options,
                autoGenerateObjectIDIfNotExist,
                batchSize,
            });
            // eslint-disable-next-line functional/immutable-data
            responses.push(saveObjectsWaitablePromise);
            return safe ? saveObjectsWaitablePromise.wait(options) : saveObjectsWaitablePromise;
        })
            .then(() => {
            const moveWaitablePromise = operation(temporaryIndexName, base.indexName, 'move', options);
            // eslint-disable-next-line functional/immutable-data
            responses.push(moveWaitablePromise);
            return safe ? moveWaitablePromise.wait(options) : moveWaitablePromise;
        })
            .then(() => Promise.all(responses))
            .then(([copyResponse, saveObjectsResponse, moveResponse]) => {
            return {
                objectIDs: saveObjectsResponse.objectIDs,
                taskIDs: [copyResponse.taskID, ...saveObjectsResponse.taskIDs, moveResponse.taskID],
            };
        });
        return clientCommon.createWaitablePromise(result, (_, waitRequestOptions) => {
            return Promise.all(responses.map(response => response.wait(waitRequestOptions)));
        });
    };
};

const replaceAllRules = (base) => {
    return (rules, requestOptions) => {
        return saveRules(base)(rules, {
            ...requestOptions,
            clearExistingRules: true,
        });
    };
};

const replaceAllSynonyms = (base) => {
    return (synonyms, requestOptions) => {
        return saveSynonyms(base)(synonyms, {
            ...requestOptions,
            clearExistingSynonyms: true,
        });
    };
};

const saveObject = (base) => {
    return (object, requestOptions) => {
        return clientCommon.createWaitablePromise(saveObjects(base)([object], requestOptions).then(response => {
            return {
                objectID: response.objectIDs[0],
                taskID: response.taskIDs[0],
            };
        }), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const saveObjects = (base) => {
    return (objects, requestOptions) => {
        const { autoGenerateObjectIDIfNotExist, ...options } = requestOptions || {};
        const action = autoGenerateObjectIDIfNotExist
            ? BatchActionEnum.AddObject
            : BatchActionEnum.UpdateObject;
        if (action === BatchActionEnum.UpdateObject) {
            // eslint-disable-next-line functional/no-loop-statement
            for (const object of objects) {
                if (object.objectID === undefined) {
                    return clientCommon.createWaitablePromise(Promise.reject(createMissingObjectIDError()));
                }
            }
        }
        return chunkedBatch(base)(objects, action, options);
    };
};

const saveRule = (base) => {
    return (rule, requestOptions) => {
        return saveRules(base)([rule], requestOptions);
    };
};

const saveRules = (base) => {
    return (rules, requestOptions) => {
        const { forwardToReplicas, clearExistingRules, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        if (clearExistingRules) {
            mappedRequestOptions.queryParameters.clearExistingRules = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/rules/batch', base.indexName),
            data: rules,
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const saveSynonym = (base) => {
    return (synonym, requestOptions) => {
        return saveSynonyms(base)([synonym], requestOptions);
    };
};

const saveSynonyms = (base) => {
    return (synonyms, requestOptions) => {
        const { forwardToReplicas, clearExistingSynonyms, replaceExistingSynonyms, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        if (replaceExistingSynonyms || clearExistingSynonyms) {
            mappedRequestOptions.queryParameters.replaceExistingSynonyms = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/synonyms/batch', base.indexName),
            data: synonyms,
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const search = (base) => {
    return (query, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/query', base.indexName),
            data: {
                query,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const searchForFacetValues = (base) => {
    return (facetName, facetQuery, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/facets/%s/query', base.indexName, facetName),
            data: {
                facetQuery,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const searchRules = (base) => {
    return (query, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/rules/search', base.indexName),
            data: {
                query,
            },
        }, requestOptions);
    };
};

const searchSynonyms = (base) => {
    return (query, requestOptions) => {
        return base.transporter.read({
            method: requesterCommon.MethodEnum.Post,
            path: clientCommon.encode('1/indexes/%s/synonyms/search', base.indexName),
            data: {
                query,
            },
        }, requestOptions);
    };
};

const setSettings = (base) => {
    return (settings, requestOptions) => {
        const { forwardToReplicas, ...options } = requestOptions || {};
        const mappedRequestOptions = transporter.createMappedRequestOptions(options);
        if (forwardToReplicas) {
            mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
        }
        return clientCommon.createWaitablePromise(base.transporter.write({
            method: requesterCommon.MethodEnum.Put,
            path: clientCommon.encode('1/indexes/%s/settings', base.indexName),
            data: settings,
        }, mappedRequestOptions), (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions));
    };
};

const waitTask = (base) => {
    return (taskID, requestOptions) => {
        return clientCommon.createRetryablePromise(retry => {
            return getTask(base)(taskID, requestOptions).then(response => {
                return response.status !== 'published' ? retry() : undefined;
            });
        });
    };
};

const ApiKeyACLEnum = {
    AddObject: 'addObject',
    Analytics: 'analytics',
    Browser: 'browse',
    DeleteIndex: 'deleteIndex',
    DeleteObject: 'deleteObject',
    EditSettings: 'editSettings',
    ListIndexes: 'listIndexes',
    Logs: 'logs',
    Personalization: 'personalization',
    Recommendation: 'recommendation',
    Search: 'search',
    SeeUnretrievableAttributes: 'seeUnretrievableAttributes',
    Settings: 'settings',
    Usage: 'usage',
};

const BatchActionEnum = {
    AddObject: 'addObject',
    UpdateObject: 'updateObject',
    PartialUpdateObject: 'partialUpdateObject',
    PartialUpdateObjectNoCreate: 'partialUpdateObjectNoCreate',
    DeleteObject: 'deleteObject',
    DeleteIndex: 'delete',
    ClearIndex: 'clear',
};

const ScopeEnum = {
    Settings: 'settings',
    Synonyms: 'synonyms',
    Rules: 'rules',
};

const StrategyEnum = {
    None: 'none',
    StopIfEnoughMatches: 'stopIfEnoughMatches',
};

const SynonymEnum = {
    Synonym: 'synonym',
    OneWaySynonym: 'oneWaySynonym',
    AltCorrection1: 'altCorrection1',
    AltCorrection2: 'altCorrection2',
    Placeholder: 'placeholder',
};

exports.ApiKeyACLEnum = ApiKeyACLEnum;
exports.BatchActionEnum = BatchActionEnum;
exports.ScopeEnum = ScopeEnum;
exports.StrategyEnum = StrategyEnum;
exports.SynonymEnum = SynonymEnum;
exports.addApiKey = addApiKey;
exports.assignUserID = assignUserID;
exports.assignUserIDs = assignUserIDs;
exports.batch = batch;
exports.browseObjects = browseObjects;
exports.browseRules = browseRules;
exports.browseSynonyms = browseSynonyms;
exports.chunkedBatch = chunkedBatch;
exports.clearDictionaryEntries = clearDictionaryEntries;
exports.clearObjects = clearObjects;
exports.clearRules = clearRules;
exports.clearSynonyms = clearSynonyms;
exports.copyIndex = copyIndex;
exports.copyRules = copyRules;
exports.copySettings = copySettings;
exports.copySynonyms = copySynonyms;
exports.createBrowsablePromise = createBrowsablePromise;
exports.createMissingObjectIDError = createMissingObjectIDError;
exports.createObjectNotFoundError = createObjectNotFoundError;
exports.createSearchClient = createSearchClient;
exports.createValidUntilNotFoundError = createValidUntilNotFoundError;
exports.customRequest = customRequest;
exports.deleteApiKey = deleteApiKey;
exports.deleteBy = deleteBy;
exports.deleteDictionaryEntries = deleteDictionaryEntries;
exports.deleteIndex = deleteIndex;
exports.deleteObject = deleteObject;
exports.deleteObjects = deleteObjects;
exports.deleteRule = deleteRule;
exports.deleteSynonym = deleteSynonym;
exports.exists = exists;
exports.findAnswers = findAnswers;
exports.findObject = findObject;
exports.generateSecuredApiKey = generateSecuredApiKey;
exports.getApiKey = getApiKey;
exports.getAppTask = getAppTask;
exports.getDictionarySettings = getDictionarySettings;
exports.getLogs = getLogs;
exports.getObject = getObject;
exports.getObjectPosition = getObjectPosition;
exports.getObjects = getObjects;
exports.getRule = getRule;
exports.getSecuredApiKeyRemainingValidity = getSecuredApiKeyRemainingValidity;
exports.getSettings = getSettings;
exports.getSynonym = getSynonym;
exports.getTask = getTask;
exports.getTopUserIDs = getTopUserIDs;
exports.getUserID = getUserID;
exports.hasPendingMappings = hasPendingMappings;
exports.initIndex = initIndex;
exports.listApiKeys = listApiKeys;
exports.listClusters = listClusters;
exports.listIndices = listIndices;
exports.listUserIDs = listUserIDs;
exports.moveIndex = moveIndex;
exports.multipleBatch = multipleBatch;
exports.multipleGetObjects = multipleGetObjects;
exports.multipleQueries = multipleQueries;
exports.multipleSearchForFacetValues = multipleSearchForFacetValues;
exports.partialUpdateObject = partialUpdateObject;
exports.partialUpdateObjects = partialUpdateObjects;
exports.removeUserID = removeUserID;
exports.replaceAllObjects = replaceAllObjects;
exports.replaceAllRules = replaceAllRules;
exports.replaceAllSynonyms = replaceAllSynonyms;
exports.replaceDictionaryEntries = replaceDictionaryEntries;
exports.restoreApiKey = restoreApiKey;
exports.saveDictionaryEntries = saveDictionaryEntries;
exports.saveObject = saveObject;
exports.saveObjects = saveObjects;
exports.saveRule = saveRule;
exports.saveRules = saveRules;
exports.saveSynonym = saveSynonym;
exports.saveSynonyms = saveSynonyms;
exports.search = search;
exports.searchDictionaryEntries = searchDictionaryEntries;
exports.searchForFacetValues = searchForFacetValues;
exports.searchRules = searchRules;
exports.searchSynonyms = searchSynonyms;
exports.searchUserIDs = searchUserIDs;
exports.setDictionarySettings = setDictionarySettings;
exports.setSettings = setSettings;
exports.updateApiKey = updateApiKey;
exports.waitAppTask = waitAppTask;
exports.waitTask = waitTask;


/***/ }),

/***/ 207:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(1);


/***/ }),

/***/ 439:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function createNullLogger() {
    return {
        debug(_message, _args) {
            return Promise.resolve();
        },
        info(_message, _args) {
            return Promise.resolve();
        },
        error(_message, _args) {
            return Promise.resolve();
        },
    };
}

const LogLevelEnum = {
    Debug: 1,
    Info: 2,
    Error: 3,
};

exports.LogLevelEnum = LogLevelEnum;
exports.createNullLogger = createNullLogger;


/***/ }),

/***/ 153:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(439);


/***/ }),

/***/ 818:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const MethodEnum = {
    Delete: 'DELETE',
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
};

exports.MethodEnum = MethodEnum;


/***/ }),

/***/ 289:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(818);


/***/ }),

/***/ 90:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var http = __nccwpck_require__(685);
var https = __nccwpck_require__(687);
var URL = __nccwpck_require__(310);

/* eslint functional/prefer-readonly-type: 0 */
const agentOptions = { keepAlive: true };
const defaultHttpAgent = new http.Agent(agentOptions);
const defaultHttpsAgent = new https.Agent(agentOptions);
function createNodeHttpRequester({ agent: userGlobalAgent, httpAgent: userHttpAgent, httpsAgent: userHttpsAgent, requesterOptions = {}, } = {}) {
    const httpAgent = userHttpAgent || userGlobalAgent || defaultHttpAgent;
    const httpsAgent = userHttpsAgent || userGlobalAgent || defaultHttpsAgent;
    return {
        send(request) {
            return new Promise(resolve => {
                const url = URL.parse(request.url);
                const path = url.query === null ? url.pathname : `${url.pathname}?${url.query}`;
                const options = {
                    ...requesterOptions,
                    agent: url.protocol === 'https:' ? httpsAgent : httpAgent,
                    hostname: url.hostname,
                    path,
                    method: request.method,
                    headers: {
                        ...(requesterOptions && requesterOptions.headers ? requesterOptions.headers : {}),
                        ...request.headers,
                    },
                    ...(url.port !== undefined ? { port: url.port || '' } : {}),
                };
                const req = (url.protocol === 'https:' ? https : http).request(options, response => {
                    // eslint-disable-next-line functional/no-let
                    let contentBuffers = [];
                    response.on('data', chunk => {
                        contentBuffers = contentBuffers.concat(chunk);
                    });
                    response.on('end', () => {
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        clearTimeout(connectTimeout);
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        clearTimeout(responseTimeout);
                        resolve({
                            status: response.statusCode || 0,
                            content: Buffer.concat(contentBuffers).toString(),
                            isTimedOut: false,
                        });
                    });
                });
                const createTimeout = (timeout, content) => {
                    return setTimeout(() => {
                        req.abort();
                        resolve({
                            status: 0,
                            content,
                            isTimedOut: true,
                        });
                    }, timeout * 1000);
                };
                const connectTimeout = createTimeout(request.connectTimeout, 'Connection timeout');
                // eslint-disable-next-line functional/no-let
                let responseTimeout;
                req.on('error', error => {
                    clearTimeout(connectTimeout);
                    clearTimeout(responseTimeout);
                    resolve({ status: 0, content: error.message, isTimedOut: false });
                });
                req.once('response', () => {
                    clearTimeout(connectTimeout);
                    responseTimeout = createTimeout(request.responseTimeout, 'Socket timeout');
                });
                if (request.data !== undefined) {
                    req.write(request.data);
                }
                req.end();
            });
        },
        destroy() {
            httpAgent.destroy();
            httpsAgent.destroy();
            return Promise.resolve();
        },
    };
}

exports.createNodeHttpRequester = createNodeHttpRequester;


/***/ }),

/***/ 80:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(90);


/***/ }),

/***/ 719:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var requesterCommon = __nccwpck_require__(289);

function createMappedRequestOptions(requestOptions, timeout) {
    const options = requestOptions || {};
    const data = options.data || {};
    Object.keys(options).forEach(key => {
        if (['timeout', 'headers', 'queryParameters', 'data', 'cacheable'].indexOf(key) === -1) {
            data[key] = options[key]; // eslint-disable-line functional/immutable-data
        }
    });
    return {
        data: Object.entries(data).length > 0 ? data : undefined,
        timeout: options.timeout || timeout,
        headers: options.headers || {},
        queryParameters: options.queryParameters || {},
        cacheable: options.cacheable,
    };
}

const CallEnum = {
    /**
     * If the host is read only.
     */
    Read: 1,
    /**
     * If the host is write only.
     */
    Write: 2,
    /**
     * If the host is both read and write.
     */
    Any: 3,
};

const HostStatusEnum = {
    Up: 1,
    Down: 2,
    Timeouted: 3,
};

// By default, API Clients at Algolia have expiration delay
// of 5 mins. In the JavaScript client, we have 2 mins.
const EXPIRATION_DELAY = 2 * 60 * 1000;
function createStatefulHost(host, status = HostStatusEnum.Up) {
    return {
        ...host,
        status,
        lastUpdate: Date.now(),
    };
}
function isStatefulHostUp(host) {
    return host.status === HostStatusEnum.Up || Date.now() - host.lastUpdate > EXPIRATION_DELAY;
}
function isStatefulHostTimeouted(host) {
    return (host.status === HostStatusEnum.Timeouted && Date.now() - host.lastUpdate <= EXPIRATION_DELAY);
}

function createStatelessHost(options) {
    if (typeof options === 'string') {
        return {
            protocol: 'https',
            url: options,
            accept: CallEnum.Any,
        };
    }
    return {
        protocol: options.protocol || 'https',
        url: options.url,
        accept: options.accept || CallEnum.Any,
    };
}

function createRetryableOptions(hostsCache, statelessHosts) {
    return Promise.all(statelessHosts.map(statelessHost => {
        return hostsCache.get(statelessHost, () => {
            return Promise.resolve(createStatefulHost(statelessHost));
        });
    })).then(statefulHosts => {
        const hostsUp = statefulHosts.filter(host => isStatefulHostUp(host));
        const hostsTimeouted = statefulHosts.filter(host => isStatefulHostTimeouted(host));
        /**
         * Note, we put the hosts that previously timeouted on the end of the list.
         */
        const hostsAvailable = [...hostsUp, ...hostsTimeouted];
        const statelessHostsAvailable = hostsAvailable.length > 0
            ? hostsAvailable.map(host => createStatelessHost(host))
            : statelessHosts;
        return {
            getTimeout(timeoutsCount, baseTimeout) {
                /**
                 * Imagine that you have 4 hosts, if timeouts will increase
                 * on the following way: 1 (timeouted) > 4 (timeouted) > 5 (200)
                 *
                 * Note that, the very next request, we start from the previous timeout
                 *
                 *  5 (timeouted) > 6 (timeouted) > 7 ...
                 *
                 * This strategy may need to be reviewed, but is the strategy on the our
                 * current v3 version.
                 */
                const timeoutMultiplier = hostsTimeouted.length === 0 && timeoutsCount === 0
                    ? 1
                    : hostsTimeouted.length + 3 + timeoutsCount;
                return timeoutMultiplier * baseTimeout;
            },
            statelessHosts: statelessHostsAvailable,
        };
    });
}

const isNetworkError = ({ isTimedOut, status }) => {
    return !isTimedOut && ~~status === 0;
};
const isRetryable = (response) => {
    const status = response.status;
    const isTimedOut = response.isTimedOut;
    return (isTimedOut || isNetworkError(response) || (~~(status / 100) !== 2 && ~~(status / 100) !== 4));
};
const isSuccess = ({ status }) => {
    return ~~(status / 100) === 2;
};
const retryDecision = (response, outcomes) => {
    if (isRetryable(response)) {
        return outcomes.onRetry(response);
    }
    if (isSuccess(response)) {
        return outcomes.onSuccess(response);
    }
    return outcomes.onFail(response);
};

function retryableRequest(transporter, statelessHosts, request, requestOptions) {
    const stackTrace = []; // eslint-disable-line functional/prefer-readonly-type
    /**
     * First we prepare the payload that do not depend from hosts.
     */
    const data = serializeData(request, requestOptions);
    const headers = serializeHeaders(transporter, requestOptions);
    const method = request.method;
    // On `GET`, the data is proxied to query parameters.
    const dataQueryParameters = request.method !== requesterCommon.MethodEnum.Get
        ? {}
        : {
            ...request.data,
            ...requestOptions.data,
        };
    const queryParameters = {
        'x-algolia-agent': transporter.userAgent.value,
        ...transporter.queryParameters,
        ...dataQueryParameters,
        ...requestOptions.queryParameters,
    };
    let timeoutsCount = 0; // eslint-disable-line functional/no-let
    const retry = (hosts, // eslint-disable-line functional/prefer-readonly-type
    getTimeout) => {
        /**
         * We iterate on each host, until there is no host left.
         */
        const host = hosts.pop(); // eslint-disable-line functional/immutable-data
        if (host === undefined) {
            throw createRetryError(stackTraceWithoutCredentials(stackTrace));
        }
        const payload = {
            data,
            headers,
            method,
            url: serializeUrl(host, request.path, queryParameters),
            connectTimeout: getTimeout(timeoutsCount, transporter.timeouts.connect),
            responseTimeout: getTimeout(timeoutsCount, requestOptions.timeout),
        };
        /**
         * The stackFrame is pushed to the stackTrace so we
         * can have information about onRetry and onFailure
         * decisions.
         */
        const pushToStackTrace = (response) => {
            const stackFrame = {
                request: payload,
                response,
                host,
                triesLeft: hosts.length,
            };
            // eslint-disable-next-line functional/immutable-data
            stackTrace.push(stackFrame);
            return stackFrame;
        };
        const decisions = {
            onSuccess: response => deserializeSuccess(response),
            onRetry(response) {
                const stackFrame = pushToStackTrace(response);
                /**
                 * If response is a timeout, we increaset the number of
                 * timeouts so we can increase the timeout later.
                 */
                if (response.isTimedOut) {
                    timeoutsCount++;
                }
                return Promise.all([
                    /**
                     * Failures are individually send the logger, allowing
                     * the end user to debug / store stack frames even
                     * when a retry error does not happen.
                     */
                    transporter.logger.info('Retryable failure', stackFrameWithoutCredentials(stackFrame)),
                    /**
                     * We also store the state of the host in failure cases. If the host, is
                     * down it will remain down for the next 2 minutes. In a timeout situation,
                     * this host will be added end of the list of hosts on the next request.
                     */
                    transporter.hostsCache.set(host, createStatefulHost(host, response.isTimedOut ? HostStatusEnum.Timeouted : HostStatusEnum.Down)),
                ]).then(() => retry(hosts, getTimeout));
            },
            onFail(response) {
                pushToStackTrace(response);
                throw deserializeFailure(response, stackTraceWithoutCredentials(stackTrace));
            },
        };
        return transporter.requester.send(payload).then(response => {
            return retryDecision(response, decisions);
        });
    };
    /**
     * Finally, for each retryable host perform request until we got a non
     * retryable response. Some notes here:
     *
     * 1. The reverse here is applied so we can apply a `pop` later on => more performant.
     * 2. We also get from the retryable options a timeout multiplier that is tailored
     * for the current context.
     */
    return createRetryableOptions(transporter.hostsCache, statelessHosts).then(options => {
        return retry([...options.statelessHosts].reverse(), options.getTimeout);
    });
}

function createTransporter(options) {
    const { hostsCache, logger, requester, requestsCache, responsesCache, timeouts, userAgent, hosts, queryParameters, headers, } = options;
    const transporter = {
        hostsCache,
        logger,
        requester,
        requestsCache,
        responsesCache,
        timeouts,
        userAgent,
        headers,
        queryParameters,
        hosts: hosts.map(host => createStatelessHost(host)),
        read(request, requestOptions) {
            /**
             * First, we compute the user request options. Now, keep in mind,
             * that using request options the user is able to modified the intire
             * payload of the request. Such as headers, query parameters, and others.
             */
            const mappedRequestOptions = createMappedRequestOptions(requestOptions, transporter.timeouts.read);
            const createRetryableRequest = () => {
                /**
                 * Then, we prepare a function factory that contains the construction of
                 * the retryable request. At this point, we may *not* perform the actual
                 * request. But we want to have the function factory ready.
                 */
                return retryableRequest(transporter, transporter.hosts.filter(host => (host.accept & CallEnum.Read) !== 0), request, mappedRequestOptions);
            };
            /**
             * Once we have the function factory ready, we need to determine of the
             * request is "cacheable" - should be cached. Note that, once again,
             * the user can force this option.
             */
            const cacheable = mappedRequestOptions.cacheable !== undefined
                ? mappedRequestOptions.cacheable
                : request.cacheable;
            /**
             * If is not "cacheable", we immediatly trigger the retryable request, no
             * need to check cache implementations.
             */
            if (cacheable !== true) {
                return createRetryableRequest();
            }
            /**
             * If the request is "cacheable", we need to first compute the key to ask
             * the cache implementations if this request is on progress or if the
             * response already exists on the cache.
             */
            const key = {
                request,
                mappedRequestOptions,
                transporter: {
                    queryParameters: transporter.queryParameters,
                    headers: transporter.headers,
                },
            };
            /**
             * With the computed key, we first ask the responses cache
             * implemention if this request was been resolved before.
             */
            return transporter.responsesCache.get(key, () => {
                /**
                 * If the request has never resolved before, we actually ask if there
                 * is a current request with the same key on progress.
                 */
                return transporter.requestsCache.get(key, () => {
                    return (transporter.requestsCache
                        /**
                         * Finally, if there is no request in progress with the same key,
                         * this `createRetryableRequest()` will actually trigger the
                         * retryable request.
                         */
                        .set(key, createRetryableRequest())
                        .then(response => Promise.all([transporter.requestsCache.delete(key), response]), err => Promise.all([transporter.requestsCache.delete(key), Promise.reject(err)]))
                        .then(([_, response]) => response));
                });
            }, {
                /**
                 * Of course, once we get this response back from the server, we
                 * tell response cache to actually store the received response
                 * to be used later.
                 */
                miss: response => transporter.responsesCache.set(key, response),
            });
        },
        write(request, requestOptions) {
            /**
             * On write requests, no cache mechanisms are applied, and we
             * proxy the request immediately to the requester.
             */
            return retryableRequest(transporter, transporter.hosts.filter(host => (host.accept & CallEnum.Write) !== 0), request, createMappedRequestOptions(requestOptions, transporter.timeouts.write));
        },
    };
    return transporter;
}

function createUserAgent(version) {
    const userAgent = {
        value: `Algolia for JavaScript (${version})`,
        add(options) {
            const addedUserAgent = `; ${options.segment}${options.version !== undefined ? ` (${options.version})` : ''}`;
            if (userAgent.value.indexOf(addedUserAgent) === -1) {
                // eslint-disable-next-line functional/immutable-data
                userAgent.value = `${userAgent.value}${addedUserAgent}`;
            }
            return userAgent;
        },
    };
    return userAgent;
}

function deserializeSuccess(response) {
    // eslint-disable-next-line functional/no-try-statement
    try {
        return JSON.parse(response.content);
    }
    catch (e) {
        throw createDeserializationError(e.message, response);
    }
}
function deserializeFailure({ content, status }, stackFrame) {
    // eslint-disable-next-line functional/no-let
    let message = content;
    // eslint-disable-next-line functional/no-try-statement
    try {
        message = JSON.parse(content).message;
    }
    catch (e) {
        // ..
    }
    return createApiError(message, status, stackFrame);
}

// eslint-disable-next-line functional/prefer-readonly-type
function encode(format, ...args) {
    // eslint-disable-next-line functional/no-let
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}

function serializeUrl(host, path, queryParameters) {
    const queryParametersAsString = serializeQueryParameters(queryParameters);
    // eslint-disable-next-line functional/no-let
    let url = `${host.protocol}://${host.url}/${path.charAt(0) === '/' ? path.substr(1) : path}`;
    if (queryParametersAsString.length) {
        url += `?${queryParametersAsString}`;
    }
    return url;
}
function serializeQueryParameters(parameters) {
    const isObjectOrArray = (value) => Object.prototype.toString.call(value) === '[object Object]' ||
        Object.prototype.toString.call(value) === '[object Array]';
    return Object.keys(parameters)
        .map(key => encode('%s=%s', key, isObjectOrArray(parameters[key]) ? JSON.stringify(parameters[key]) : parameters[key]))
        .join('&');
}
function serializeData(request, requestOptions) {
    if (request.method === requesterCommon.MethodEnum.Get ||
        (request.data === undefined && requestOptions.data === undefined)) {
        return undefined;
    }
    const data = Array.isArray(request.data)
        ? request.data
        : { ...request.data, ...requestOptions.data };
    return JSON.stringify(data);
}
function serializeHeaders(transporter, requestOptions) {
    const headers = {
        ...transporter.headers,
        ...requestOptions.headers,
    };
    const serializedHeaders = {};
    Object.keys(headers).forEach(header => {
        const value = headers[header];
        // @ts-ignore
        // eslint-disable-next-line functional/immutable-data
        serializedHeaders[header.toLowerCase()] = value;
    });
    return serializedHeaders;
}

function stackTraceWithoutCredentials(stackTrace) {
    return stackTrace.map(stackFrame => stackFrameWithoutCredentials(stackFrame));
}
function stackFrameWithoutCredentials(stackFrame) {
    const modifiedHeaders = stackFrame.request.headers['x-algolia-api-key']
        ? { 'x-algolia-api-key': '*****' }
        : {};
    return {
        ...stackFrame,
        request: {
            ...stackFrame.request,
            headers: {
                ...stackFrame.request.headers,
                ...modifiedHeaders,
            },
        },
    };
}

function createApiError(message, status, transporterStackTrace) {
    return {
        name: 'ApiError',
        message,
        status,
        transporterStackTrace,
    };
}

function createDeserializationError(message, response) {
    return {
        name: 'DeserializationError',
        message,
        response,
    };
}

function createRetryError(transporterStackTrace) {
    return {
        name: 'RetryError',
        message: 'Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com.',
        transporterStackTrace,
    };
}

exports.CallEnum = CallEnum;
exports.HostStatusEnum = HostStatusEnum;
exports.createApiError = createApiError;
exports.createDeserializationError = createDeserializationError;
exports.createMappedRequestOptions = createMappedRequestOptions;
exports.createRetryError = createRetryError;
exports.createStatefulHost = createStatefulHost;
exports.createStatelessHost = createStatelessHost;
exports.createTransporter = createTransporter;
exports.createUserAgent = createUserAgent;
exports.deserializeFailure = deserializeFailure;
exports.deserializeSuccess = deserializeSuccess;
exports.isStatefulHostTimeouted = isStatefulHostTimeouted;
exports.isStatefulHostUp = isStatefulHostUp;
exports.serializeData = serializeData;
exports.serializeHeaders = serializeHeaders;
exports.serializeQueryParameters = serializeQueryParameters;
exports.serializeUrl = serializeUrl;
exports.stackFrameWithoutCredentials = stackFrameWithoutCredentials;
exports.stackTraceWithoutCredentials = stackTraceWithoutCredentials;


/***/ }),

/***/ 739:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// eslint-disable-next-line functional/immutable-data, import/no-commonjs
module.exports = __nccwpck_require__(719);


/***/ }),

/***/ 861:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var cacheCommon = __nccwpck_require__(17);
var cacheInMemory = __nccwpck_require__(458);
var clientAnalytics = __nccwpck_require__(591);
var clientCommon = __nccwpck_require__(201);
var clientPersonalization = __nccwpck_require__(830);
var clientSearch = __nccwpck_require__(207);
var loggerCommon = __nccwpck_require__(153);
var requesterNodeHttp = __nccwpck_require__(80);
var transporter = __nccwpck_require__(739);

function algoliasearch(appId, apiKey, options) {
    const commonOptions = {
        appId,
        apiKey,
        timeouts: {
            connect: 2,
            read: 5,
            write: 30,
        },
        requester: requesterNodeHttp.createNodeHttpRequester(),
        logger: loggerCommon.createNullLogger(),
        responsesCache: cacheCommon.createNullCache(),
        requestsCache: cacheCommon.createNullCache(),
        hostsCache: cacheInMemory.createInMemoryCache(),
        userAgent: transporter.createUserAgent(clientCommon.version).add({
            segment: 'Node.js',
            version: process.versions.node,
        }),
    };
    const searchClientOptions = { ...commonOptions, ...options };
    const initPersonalization = () => (clientOptions) => {
        return clientPersonalization.createPersonalizationClient({
            ...commonOptions,
            ...clientOptions,
            methods: {
                getPersonalizationStrategy: clientPersonalization.getPersonalizationStrategy,
                setPersonalizationStrategy: clientPersonalization.setPersonalizationStrategy,
            },
        });
    };
    return clientSearch.createSearchClient({
        ...searchClientOptions,
        methods: {
            search: clientSearch.multipleQueries,
            searchForFacetValues: clientSearch.multipleSearchForFacetValues,
            multipleBatch: clientSearch.multipleBatch,
            multipleGetObjects: clientSearch.multipleGetObjects,
            multipleQueries: clientSearch.multipleQueries,
            copyIndex: clientSearch.copyIndex,
            copySettings: clientSearch.copySettings,
            copyRules: clientSearch.copyRules,
            copySynonyms: clientSearch.copySynonyms,
            moveIndex: clientSearch.moveIndex,
            listIndices: clientSearch.listIndices,
            getLogs: clientSearch.getLogs,
            listClusters: clientSearch.listClusters,
            multipleSearchForFacetValues: clientSearch.multipleSearchForFacetValues,
            getApiKey: clientSearch.getApiKey,
            addApiKey: clientSearch.addApiKey,
            listApiKeys: clientSearch.listApiKeys,
            updateApiKey: clientSearch.updateApiKey,
            deleteApiKey: clientSearch.deleteApiKey,
            restoreApiKey: clientSearch.restoreApiKey,
            assignUserID: clientSearch.assignUserID,
            assignUserIDs: clientSearch.assignUserIDs,
            getUserID: clientSearch.getUserID,
            searchUserIDs: clientSearch.searchUserIDs,
            listUserIDs: clientSearch.listUserIDs,
            getTopUserIDs: clientSearch.getTopUserIDs,
            removeUserID: clientSearch.removeUserID,
            hasPendingMappings: clientSearch.hasPendingMappings,
            generateSecuredApiKey: clientSearch.generateSecuredApiKey,
            getSecuredApiKeyRemainingValidity: clientSearch.getSecuredApiKeyRemainingValidity,
            destroy: clientCommon.destroy,
            clearDictionaryEntries: clientSearch.clearDictionaryEntries,
            deleteDictionaryEntries: clientSearch.deleteDictionaryEntries,
            getDictionarySettings: clientSearch.getDictionarySettings,
            getAppTask: clientSearch.getAppTask,
            replaceDictionaryEntries: clientSearch.replaceDictionaryEntries,
            saveDictionaryEntries: clientSearch.saveDictionaryEntries,
            searchDictionaryEntries: clientSearch.searchDictionaryEntries,
            setDictionarySettings: clientSearch.setDictionarySettings,
            waitAppTask: clientSearch.waitAppTask,
            customRequest: clientSearch.customRequest,
            initIndex: base => (indexName) => {
                return clientSearch.initIndex(base)(indexName, {
                    methods: {
                        batch: clientSearch.batch,
                        delete: clientSearch.deleteIndex,
                        findAnswers: clientSearch.findAnswers,
                        getObject: clientSearch.getObject,
                        getObjects: clientSearch.getObjects,
                        saveObject: clientSearch.saveObject,
                        saveObjects: clientSearch.saveObjects,
                        search: clientSearch.search,
                        searchForFacetValues: clientSearch.searchForFacetValues,
                        waitTask: clientSearch.waitTask,
                        setSettings: clientSearch.setSettings,
                        getSettings: clientSearch.getSettings,
                        partialUpdateObject: clientSearch.partialUpdateObject,
                        partialUpdateObjects: clientSearch.partialUpdateObjects,
                        deleteObject: clientSearch.deleteObject,
                        deleteObjects: clientSearch.deleteObjects,
                        deleteBy: clientSearch.deleteBy,
                        clearObjects: clientSearch.clearObjects,
                        browseObjects: clientSearch.browseObjects,
                        getObjectPosition: clientSearch.getObjectPosition,
                        findObject: clientSearch.findObject,
                        exists: clientSearch.exists,
                        saveSynonym: clientSearch.saveSynonym,
                        saveSynonyms: clientSearch.saveSynonyms,
                        getSynonym: clientSearch.getSynonym,
                        searchSynonyms: clientSearch.searchSynonyms,
                        browseSynonyms: clientSearch.browseSynonyms,
                        deleteSynonym: clientSearch.deleteSynonym,
                        clearSynonyms: clientSearch.clearSynonyms,
                        replaceAllObjects: clientSearch.replaceAllObjects,
                        replaceAllSynonyms: clientSearch.replaceAllSynonyms,
                        searchRules: clientSearch.searchRules,
                        getRule: clientSearch.getRule,
                        deleteRule: clientSearch.deleteRule,
                        saveRule: clientSearch.saveRule,
                        saveRules: clientSearch.saveRules,
                        replaceAllRules: clientSearch.replaceAllRules,
                        browseRules: clientSearch.browseRules,
                        clearRules: clientSearch.clearRules,
                    },
                });
            },
            initAnalytics: () => (clientOptions) => {
                return clientAnalytics.createAnalyticsClient({
                    ...commonOptions,
                    ...clientOptions,
                    methods: {
                        addABTest: clientAnalytics.addABTest,
                        getABTest: clientAnalytics.getABTest,
                        getABTests: clientAnalytics.getABTests,
                        stopABTest: clientAnalytics.stopABTest,
                        deleteABTest: clientAnalytics.deleteABTest,
                    },
                });
            },
            initPersonalization,
            initRecommendation: () => (clientOptions) => {
                searchClientOptions.logger.info('The `initRecommendation` method is deprecated. Use `initPersonalization` instead.');
                return initPersonalization()(clientOptions);
            },
        },
    });
}
// eslint-disable-next-line functional/immutable-data
algoliasearch.version = clientCommon.version;

module.exports = algoliasearch;


/***/ }),

/***/ 178:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable functional/immutable-data, import/no-commonjs */
const algoliasearch = __nccwpck_require__(861);

/**
 * The Common JS build is the default entry point for the Node environment. Keep in
 * in mind, that for the browser environment, we hint the bundler to use the UMD
 * build instead as specified on the key `browser` of our `package.json` file.
 */
module.exports = algoliasearch;

/**
 * In addition, we also set explicitly the default export below making
 * this Common JS module in compliance with es6 modules specification.
 */
module.exports["default"] = algoliasearch;


/***/ }),

/***/ 113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 282:
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ 310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

const algoliasearch = __nccwpck_require__(178);
const fs = __nccwpck_require__(147);
const { exit } = __nccwpck_require__(282);
const APPLICATION_ID = process.env.APPLICATION_ID;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const INDEX_NAME = process.env.INDEX_NAME;
const FILE_PATH = process.env.FILE_PATH;
if (!APPLICATION_ID && !ADMIN_API_KEY && !INDEX_NAME && !FILE_PATH) {
    exit();
}
const client = algoliasearch(APPLICATION_ID, ADMIN_API_KEY);
const index = client.initIndex(INDEX_NAME);
try {
    console.log("Start to save Objects");
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    const objects = JSON.parse(data);
    index
        .saveObjects(objects, { autoGenerateObjectIDIfNotExist: true })
        .then(({ objectIDs }) => {
        console.log(objectIDs);
        console.log("Successfully saved Objects");
    });
}
catch (err) {
    console.error(err);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;