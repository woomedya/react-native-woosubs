import Crypto from 'woo-crypto';
import { getUTCTime } from './utilities/date';
import opts from './config';
import Axios from "axios";

const post = async (baseURL, url, headers, data) => {
    var instance = Axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    var responseJson = await instance.post(url, data);

    return responseJson.data
}

export const iysRequest = async (obj) => {
    try {
        var type = 'content.export';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.tokenTimeout).toString(), type }), opts.publicKey, opts.privateKey));
        var resault = await post(opts.wooServerUrl, "/content/export", {
            public: opts.publicKey,
            token
        }, {
            ...obj
        });

        return resault.data;
    } catch (error) {
        return []
    }
}