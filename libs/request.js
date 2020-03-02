import Post from './utilities/post';
import Crypto from 'woo-crypto';
import { getUTCTime } from './utilities/date';
import opts from './config';

export const iysRequest = async (obj) => {
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