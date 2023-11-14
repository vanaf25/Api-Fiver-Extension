import https from "https";
export class XhrResponse {
    data = null;
    headers = {};
    statusCode = 0;
    res;
    isError = false;
    errorMessage = null;
    setData(data) {
        this.data = data;
    }
    setHeaders(headers) {
        this.headers = this.parseHeaders(headers);
    }
    parseHeaders(headers) {
        const resHeaders = {};
        for (let key in headers) {
            const kLower = key.toLowerCase();
            if (kLower === "content-type") {
                //@ts-ignore
                resHeaders.contentType = this.getContentType(headers[key]);
                continue;
            }
            if (kLower === "set-cookie") {
                resHeaders.cookies = headers[key];
                continue;
            }
            resHeaders[key] = headers[key];
        }
        return resHeaders;
    }
    getContentType(value) {
        return value.split(";").at(0);
    }
    setStatusCode(statusCode) {
        this.statusCode = statusCode;
    }
    setResHttp(res) {
        this.res = res;
    }
    setError(message) {
        this.errorMessage = message;
        this.isError = true;
    }
}
var Methods;
(function (Methods) {
    Methods["GET"] = "GET";
})(Methods || (Methods = {}));
class Xhr {
    get(url, options = {}) {
        return this.request(url, Methods.GET, options);
    }
    request(url, method, options = {}) {
        const { host, pathname } = new URL(url);
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
            },
            method,
            port: 443,
            host: host,
            path: pathname,
        };
        return new Promise((resolve, reject) => {
            const response = new XhrResponse();
            let buffData = "";
            const req = https.request(requestOptions, (res) => {
                response.setHeaders(res.headers);
                response.setStatusCode(res.statusCode);
                response.setResHttp(res);
                res.on("data", (chunk) => {
                    buffData += chunk;
                });
                res.on("end", () => {
                    response.setData(buffData);
                    resolve(response);
                });
                res.on("error", (err) => {
                    response.setError(err.toString());
                    reject(response);
                });
            });
            req.on("error", (err) => {
                response.setError(err.toString());
                reject(response);
            });
            req.end();
        });
    }
}
export const xhr = new Xhr();
