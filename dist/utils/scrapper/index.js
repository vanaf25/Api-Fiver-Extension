import { parse } from "node-html-parser";
import { xhr } from "../xhr";
import { AUTHOR_GIG_KEY, FIVERR_HOST, GIG_DATA_KEY, GIG_SCRIPT_ID_SELECTOR, HTML_CONTENT_TYPE } from "./consts";
import { randomUserAgent } from "./helpers";
const defaultOptions = {
    headers: {
        'User-Agent': randomUserAgent()
    }
};
class Scrapper {
    async getGigData(url) {
        const response = await this.apiRequest(url);
        const gigData = this.getGigDataFromHtml(parse(response.data));
        if (!gigData) {
            return null;
        }
        return this.getClearGigData(gigData);
    }
    async apiRequest(url) {
        const { host } = new URL(url);
        if (host !== FIVERR_HOST) {
            /*
                        return ApiError.defaultError(`\`Url must be from ${FIVERR_HOST} host\``)
            */
        }
        const response = await xhr.get(url, defaultOptions);
        // handle redirect
        if (response.headers.location && response.statusCode >= 300 && response.statusCode <= 399) {
            return this.apiRequest(response.headers.location);
        }
        if (response.headers.contentType !== HTML_CONTENT_TYPE) {
            throw new Error(`Content-type must be ${HTML_CONTENT_TYPE}`);
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
        const gigJson = html.querySelector(GIG_SCRIPT_ID_SELECTOR);
        if (!gigJson) {
            return null;
        }
        return JSON.parse(gigJson.innerHTML);
    }
    getClearGigData(gigData) {
        console.log(gigData);
        const { gigId, categorySlug, subCategorySlug, nestedSubCategorySlug } = gigData[GIG_DATA_KEY] || {};
        const { username } = gigData[AUTHOR_GIG_KEY] || {};
        console.log(gigData[GIG_DATA_KEY]);
        let gigCategoryUrl = `https://www.fiverr.com/categories/${categorySlug}/`;
        if (subCategorySlug) {
            gigCategoryUrl += `${subCategorySlug}/`;
        }
        if (nestedSubCategorySlug) {
            gigCategoryUrl += `${nestedSubCategorySlug}`;
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
export const scrapper = new Scrapper();
