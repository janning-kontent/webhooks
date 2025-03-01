Facebook post error: {
  "message": "Request failed with status code 400",
  "name": "AxiosError",
  "stack": "AxiosError: Request failed with status code 400\n    at settle (file:///Users/chrisjanning/Projects/webhooks/node_modules/axios/lib/core/settle.js:19:12)\n    at BrotliDecompress.handleStreamEnd (file:///Users/chrisjanning/Projects/webhooks/node_modules/axios/lib/adapters/http.js:599:11)\n    at BrotliDecompress.emit (node:events:530:35)\n    at endReadableNT (node:internal/streams/readable:1698:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)\n    at Axios.request (file:///Users/chrisjanning/Projects/webhooks/node_modules/axios/lib/core/Axios.js:45:41)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async handler (webpack-internal:///(api)/./pages/api/facebook.ts:60:38)\n    at async apiResolver (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/compiled/next-server/pages-api.runtime.dev.js:21:3901)\n    at async PagesAPIRouteModule.render (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/compiled/next-server/pages-api.runtime.dev.js:21:5372)\n    at async DevServer.runApi (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/next-server.js:628:9)\n    at async NextNodeServer.handleCatchallRenderRequest (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/next-server.js:278:37)\n    at async DevServer.handleRequestImpl (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/base-server.js:853:17)\n    at async /Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/dev/next-dev-server.js:371:20\n    at async Span.traceAsyncFn (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/trace/trace.js:153:20)\n    at async DevServer.handleRequest (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/dev/next-dev-server.js:368:24)\n    at async invokeRender (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/lib/router-server.js:230:21)\n    at async handleRequest (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/lib/router-server.js:408:24)\n    at async requestHandlerImpl (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/lib/router-server.js:432:13)\n    at async Server.requestListener (/Users/chrisjanning/Projects/webhooks/node_modules/next/dist/server/lib/start-server.js:146:13)",
  "config": {
    "transitional": {
      "silentJSONParsing": true,
      "forcedJSONParsing": true,
      "clarifyTimeoutError": false
    },
    "adapter": [
      "xhr",
      "http",
      "fetch"
    ],
    "transformRequest": [
      null
    ],
    "transformResponse": [
      null
    ],
    "timeout": 0,
    "xsrfCookieName": "XSRF-TOKEN",
    "xsrfHeaderName": "X-XSRF-TOKEN",
    "maxContentLength": -1,
    "maxBodyLength": -1,
    "env": {},
    "headers": {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": "axios/1.8.1",
      "Content-Length": "514",
      "Accept-Encoding": "gzip, compress, deflate, br"
    },
    "method": "post",
    "url": "https://graph.facebook.com/562237366976984/photos",
    "data": "{\"message\":\"My first Facebook post\\n\\n#digitalmedia #socialmediamarketing #shoppablecontent #socialshopping #firstmedia #socialpost\",\"url\":\"https://assets-us-01.kc-usercontent.com:443/77d4a36f-750c-00a7-d7fa-c2d667288c4c/3759eb4f-40f5-4ea8-a34b-a616f5c94a20/og-image.png\",\"access_token\":\"EAAYgfqMcTwEBO13bn0gqFz02u05ghlOMdAL0U7HnaRTWRTWfHYwZBUOQHO7Xlwq6Fn1zIMkuua4XfIx5by1kzDlmvzUqVnV6YsMMRu1Su7l5Dzzuxks34CXJZBF8ow2G0PLTtizedksIoB8TJ7J3fY9qRaMvYBloPgChJia5r5WSOnfG69VMwEu7g6b9HUxCiU4NXMNCWW7jESXXyAgbkTBDgRnFUZB\"}",
    "allowAbsoluteUrls": true
  },
  "code": "ERR_BAD_REQUEST",
  "status": 400
}
