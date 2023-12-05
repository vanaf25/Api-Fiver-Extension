import {HTMLElement, parse} from "node-html-parser";
import {xhr, XhrResponse} from "../xhr";
import {AUTHOR_GIG_KEY, FIVERR_HOST, GIG_DATA_KEY, GIG_SCRIPT_ID_SELECTOR, HTML_CONTENT_TYPE} from "./consts";
import {randomUserAgent} from "./helpers";
import ApiError from "../../middlewares/api-error.middleware";
const defaultOptions = {
    headers: {
        'User-Agent': randomUserAgent()
    }
}

interface ScrapperResponse {
    gigId: number,
    gigCategory: string,
    gigSubCategory: string,
    gigAuthor: string,
    gigNestedSubCategory:string,
    gigCategoryUrl:string,
    url:string
}
class Scrapper {
    public async getGigData(url: string): Promise<ScrapperResponse | null> {
            const response = await this.apiRequest(url);
            const gigData = this.getGigDataFromHtml(parse(response.data));
            if (!gigData) {
                return null
            }
            return this.getClearGigData(gigData,response.url);
    }

    private async apiRequest(url,defaultHost?): Promise<any> {
        console.log('url3444:',url);
        let host=defaultHost;
        try {

            const { host:parsedHost } = new URL(url)
            if (!defaultHost) host=parsedHost
        }
        catch (e){
            throw ApiError.defaultError("Invalid Url")
        }
        console.log('host:',host)
        console.log('FiverrHost:',FIVERR_HOST);
        if (host !== FIVERR_HOST) {
            throw ApiError.defaultError(`Url must be from ${FIVERR_HOST} host`)
        }
            const response = await xhr.get(url, defaultOptions)
        // handle redirect
            if (response.headers.location && response.statusCode >= 300 && response.statusCode <= 399) {
                console.log('response.headers:',response.headers);
                return this.apiRequest(response.headers.location)
            }
            if (response.headers.contentType !== HTML_CONTENT_TYPE)
            {
                throw ApiError.defaultError(`Content-type must be ${HTML_CONTENT_TYPE}`)
            }
            if (response.isError) {
                throw ApiError.defaultError(`Xhr: ${response.errorMessage}`)
            }
            if (!(response.statusCode >= 200 && response.statusCode <= 299)) {
                throw ApiError.NotFound(`The gig was not found`)
            }
            return {...response,url}

    }
    private getGigDataFromHtml(html: HTMLElement) {
        const gigJson = html.querySelector(GIG_SCRIPT_ID_SELECTOR)
        if (!gigJson) {
            return null
        }
        return JSON.parse(gigJson.innerHTML)
    }
    private getClearGigData(gigData: object,url:string): ScrapperResponse {
        const { gigId, categorySlug, subCategorySlug,nestedSubCategorySlug,subCategoryName} = gigData[GIG_DATA_KEY] || {}
        if (!gigId) throw ApiError.defaultError("The gig with provided url doesn't exist")
        const { username } = gigData[AUTHOR_GIG_KEY] || {}
        let gigCategoryUrl=`https://www.fiverr.com/categories/${categorySlug}/`
        if (subCategorySlug){
            gigCategoryUrl+=`${subCategorySlug}`
        }
        if (nestedSubCategorySlug){
            gigCategoryUrl+=`/${nestedSubCategorySlug}`
        }
        return {
            gigId,
            gigCategory: nestedSubCategorySlug || subCategorySlug,
            gigSubCategory: subCategorySlug,
            gigAuthor: username,
            gigNestedSubCategory:nestedSubCategorySlug,
            gigCategoryUrl:gigCategoryUrl,
            url
        }
    }
}

export const scrapper = new Scrapper()