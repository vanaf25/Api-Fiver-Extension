"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapper = void 0;
const node_html_parser_1 = require("node-html-parser");
const xhr_1 = require("../xhr");
const consts_1 = require("./consts");
const helpers_1 = require("./helpers");
const api_error_middleware_1 = __importDefault(require("../../middlewares/api-error.middleware"));
const axios_1 = __importDefault(require("axios"));
const defaultOptions = {
    headers: {
        'User-Agent': "PostmanRuntime/7.36.0"
    }
};
class Scrapper {
    async getGigData(url) {
        const response = await this.apiRequest(url);
        const gigData = this.getGigDataFromHtml((0, node_html_parser_1.parse)(response.data));
        if (!gigData) {
            return null;
        }
        return this.getClearGigData(gigData, response.url);
    }
    async apiRequest(url, defaultHost) {
        console.log('URL:', url);
        let host = defaultHost;
        try {
            const { host: parsedHost } = new URL(url);
            if (!defaultHost)
                host = parsedHost;
        }
        catch (e) {
            throw api_error_middleware_1.default.defaultError("Invalid Url");
        }
        console.log('host:', host);
        console.log('FiverrHost:', consts_1.FIVERR_HOST);
        try {
            const response = await axios_1.default.head(url, { maxRedirects: 0, headers: { "User-Agent": (0, helpers_1.randomUserAgent)() } });
            console.log('location:', response.headers?.location);
        }
        catch (error) {
            console.error('Error with location:', error.message);
            // Handle error, e.g., short link is not valid
        }
        if (host !== consts_1.FIVERR_HOST) {
            throw api_error_middleware_1.default.defaultError(`Url must be from ${consts_1.FIVERR_HOST} host`);
        }
        const response = await xhr_1.xhr.get(url, defaultOptions);
        // handle redirect
        if (response.headers.location && response.statusCode >= 300 && response.statusCode <= 399) {
            console.log('response.headers:', response.headers);
            return this.apiRequest(response.headers.location);
        }
        if (response.headers.contentType !== consts_1.HTML_CONTENT_TYPE) {
            throw api_error_middleware_1.default.defaultError(`Content-type must be ${consts_1.HTML_CONTENT_TYPE}`);
        }
        if (response.isError) {
            throw api_error_middleware_1.default.defaultError(`Xhr: ${response.errorMessage}`);
        }
        if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
            throw api_error_middleware_1.default.NotFound(`The gig was not found`);
        }
        return { ...response, url };
    }
    getGigDataFromHtml(html) {
        const gigJson = html.querySelector(consts_1.GIG_SCRIPT_ID_SELECTOR);
        if (!gigJson) {
            return null;
        }
        return JSON.parse(gigJson.innerHTML);
    }
    getClearGigData(gigData, url) {
        const { gigId, categorySlug, subCategorySlug, nestedSubCategorySlug, subCategoryName } = gigData[consts_1.GIG_DATA_KEY] || {};
        if (!gigId)
            throw api_error_middleware_1.default.defaultError("The gig with provided url doesn't exist");
        const { username } = gigData[consts_1.AUTHOR_GIG_KEY] || {};
        let gigCategoryUrl = `https://www.fiverr.com/categories/${categorySlug}/`;
        if (subCategorySlug) {
            gigCategoryUrl += `${subCategorySlug}`;
        }
        if (nestedSubCategorySlug) {
            gigCategoryUrl += `/${nestedSubCategorySlug}`;
        }
        return {
            gigId,
            gigCategory: nestedSubCategorySlug || subCategorySlug,
            gigSubCategory: subCategorySlug,
            gigAuthor: username,
            gigNestedSubCategory: nestedSubCategorySlug,
            gigCategoryUrl: gigCategoryUrl,
            url
        };
    }
}
exports.scrapper = new Scrapper();
