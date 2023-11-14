const userAgents = [
    'Mozilla/5.0 (Windows NT 10.2; x64) AppleWebKit/536.47 (KHTML, like Gecko) Chrome/53.0.1978.208 Safari/603.4 Edge/8.24491',
    'Mozilla/5.0 (Linux; U; Linux i555 ; en-US) AppleWebKit/600.3 (KHTML, like Gecko) Chrome/50.0.1575.156 Safari/603',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 7_2_7; en-US) AppleWebKit/533.36 (KHTML, like Gecko) Chrome/54.0.3606.307 Safari/535',
    'Mozilla/5.0 (Windows NT 10.5; Win64; x64) AppleWebKit/601.21 (KHTML, like Gecko) Chrome/53.0.1280.181 Safari/536.3 Edge/12.31449',
    'Mozilla/5.0 (Android; Android 7.1; LG-H900 Build/NRD90M) AppleWebKit/601.24 (KHTML, like Gecko) Chrome/51.0.3814.168 Mobile Safari/600.2',
    'Mozilla/5.0 (Windows; U; Windows NT 6.2; Win64; x64; en-US) AppleWebKit/603.39 (KHTML, like Gecko) Chrome/49.0.2518.326 Safari/534.8 Edge/13.47731',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
];
export const randomUserAgent = () => {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};
