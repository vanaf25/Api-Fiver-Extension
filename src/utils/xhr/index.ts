import https, {RequestOptions} from "https";
import {IncomingMessage} from "http";

type Headers = { [key in string]: string | string[] }

export class XhrResponse {
    public data: string = null;
    public headers: Headers = {};
    public statusCode: number = 0;
    public res: IncomingMessage;
    public isError: boolean = false;
    public errorMessage: string = null;
    public setData(data: string) {
        this.data = data
    }

    public setHeaders(headers: Headers) {
        this.headers = this.parseHeaders(headers)
    }

    private parseHeaders(headers: Headers): Headers {
        const resHeaders: Headers = {}
        for (let key in headers) {
            const kLower = key.toLowerCase()
            if (kLower === "content-type") {
                //@ts-ignore
                resHeaders.contentType = this.getContentType(headers[key] as string)
                continue
            }
            if (kLower === "set-cookie") {
                resHeaders.cookies = headers[key]
                continue
            }
            resHeaders[key] = headers[key]
        }

        return resHeaders
    }

    private getContentType(value: string) {
        return value.split(";").at(0)
    }

    public setStatusCode(statusCode: number) {
        this.statusCode = statusCode;
    }

    public setResHttp(res: IncomingMessage) {
        this.res = res;
    }

    public setError(message: string) {
        this.errorMessage = message;
        this.isError = true;
    }
}

enum Methods {
    GET = 'GET',
}

class Xhr {
    public get(url, options: RequestOptions = {}): Promise<XhrResponse>  {
        return this.request(url, Methods.GET, options)
    }

    public request(url: string, method: Methods, options: RequestOptions = {}): Promise<XhrResponse> {
        const { host, pathname } = new URL(url);
        const requestOptions: RequestOptions = {
            ...options,
            headers: {
                ...options.headers,
            },
            method,
            port: 443,
            host: host,
            path: pathname,
        }
        return new Promise((resolve, reject) => {
            const response = new XhrResponse();

            let buffData = ""
            const req = https.request(requestOptions, (res) => {
                response.setHeaders(res.headers)
                response.setStatusCode(res.statusCode)
                response.setResHttp(res)
                res.on("data", (chunk) => {
                    buffData += chunk
                })
                res.on("end", () => {
                    response.setData(buffData)
                    resolve(response)
                })
                res.on("error", (err) => {
                    console.log('err:',err.toString());
                    response.setError(err.toString())
                    reject(response)
                })
            })
            req.on("error", (err) => {
                console.log('err:',err.toString());
                response.setError(err.toString())
                reject(response)
            })
            req.end()
        })
    }
}

export const xhr = new Xhr();