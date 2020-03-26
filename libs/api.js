import Crypto from 'woo-crypto';
import { getUTCTime } from 'woo-utilities/date';
import opts from '../config';
import Axios from "axios";
import { Platform } from 'react-native';

const url = {
    itemSubs: '/woosubs/itemsubs',
    itemSkus: '/woosubs/itemskus'
}

const post = async (baseURL, url, headers, data) => {
    var instance = Axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    var responseJson = await instance.post(url, data);
    return responseJson.data
}

const getSubItems = async () => {
    try {
        var type = 'woosubs.itemsubs';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.tokenTimeout).toString(), type }), opts.publicKey, opts.privateKey));
        var result = await post(opts.wooServerUrl, url.itemSubs, {
            public: opts.publicKey,
            token
        }, {
            os: Platform.OS
        });

        return result.data || { ios: [], android: [] };
    } catch (error) {
        return { ios: [], android: [] }
    }
}

const getSkuItems = async () => {
    try {
        var type = 'woosubs.itemskus';
        var token = (Crypto.encrypt(JSON.stringify({ expire: getUTCTime(opts.tokenTimeout).toString(), type }), opts.publicKey, opts.privateKey));
        var result = await post(opts.wooServerUrl, url.itemSkus, {
            public: opts.publicKey,
            token
        }, {
            os: Platform.OS
        });

        return result.data || { ios: [], android: [] };
    } catch (error) {
        return { ios: [], android: [] }
    }
}

export default {
    getSubItems, getSkuItems
}

