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
const defaultOptions = {
    headers: {
        'User-Agent': (0, helpers_1.randomUserAgent)()
    }
};
class Scrapper {
    async getGigData(url) {
        const response = await this.apiRequest(url);
        const gigData = this.getGigDataFromHtml((0, node_html_parser_1.parse)(response.data));
        console.log('gigData:', gigData);
        if (!gigData) {
            return null;
        }
        return this.getClearGigData(gigData);
    }
    async apiRequest(url) {
        console.log('url:', url);
        let host;
        try {
            const { host: parsedHost } = new URL(url);
            host = parsedHost;
        }
        catch (e) {
            throw api_error_middleware_1.default.defaultError("Invalid Url");
        }
        if (host !== consts_1.FIVERR_HOST) {
            throw api_error_middleware_1.default.defaultError(`Url must be from ${consts_1.FIVERR_HOST} host`);
        }
        const response = await xhr_1.xhr.get(url, defaultOptions);
        console.log('r:', response.statusCode);
        // handle redirect
        if (response.headers.location && response.statusCode >= 300 && response.statusCode <= 399) {
            return this.apiRequest(response.headers.location);
        }
        if (response.headers.contentType !== consts_1.HTML_CONTENT_TYPE) {
            throw new Error(`Content-type must be ${consts_1.HTML_CONTENT_TYPE}`);
        }
        if (response.isError) {
            throw new Error(`Xhr: ${response.errorMessage}`);
        }
        if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
            throw new Error(`Response with status code ${response.statusCode}`);
        }
        return response;
    }
    getGigDataFromHtml(html) {
        const gigJson = html.querySelector(consts_1.GIG_SCRIPT_ID_SELECTOR);
        if (!gigJson) {
            return null;
        }
        return JSON.parse(gigJson.innerHTML);
    }
    getClearGigData(gigData) {
        console.log(gigData);
        const { gigId, categorySlug, subCategorySlug, nestedSubCategorySlug, subCategoryName } = gigData[consts_1.GIG_DATA_KEY] || {};
        if (!gigId)
            throw api_error_middleware_1.default.defaultError("The gig with provided url doesn't exist");
        const { username } = gigData[consts_1.AUTHOR_GIG_KEY] || {};
        console.log(gigData[consts_1.GIG_DATA_KEY]);
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
            gigCategoryUrl: gigCategoryUrl
        };
    }
}
exports.scrapper = new Scrapper();
