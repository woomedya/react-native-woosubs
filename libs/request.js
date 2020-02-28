import Post from './post';
import Crypto from 'woo-crypto';
import { getUTCTime } from './date';
import opts from './config';


export const requestObj = async (obj) => {
    try {
        var type = 'content.export';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.timeout).toString(), type }), opts.publicKey, opts.privateKey));
        var resault = await Post.post(opts.wooServerUrl, "/content/export", {
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

export const baseRequest = async (url, type, obj) => {
    try {
        var type = type;
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.timeout).toString(), type }), opts.publicKey, opts.privateKey));
        var result = await Post.post(url, "", {
            public: opts.publicKey,
            token
        }, {
            ...obj
        });

        return result;
    } catch (error) {
        return null;
    }
}



/**
 * Reklam  çekilir.
 */
export const AdvWooApiGet = async (deviceId) => {
    try {
        var responseJson = (await requestAdvGet({
            categories: [],
            tags: [],
            content: {},
            applicationId: opts.applicationId,
            deviceId: deviceId

        }))
        return responseJson;
    } catch (error) {
        var eror = {}
        return eror;

    }

}

/**
 * izlendi bilgisi gönderilir.
 */
export const AdvWooApiViews = async (sessionKey) => {
    try {
        var responseJson = (await requestAdvView({
            categories: [],
            tags: [],
            content: {},
            sessionKey: sessionKey,
            applicationId: opts.applicationId
        }))
        return responseJson;
    } catch (error) {

        return {};

    }

}