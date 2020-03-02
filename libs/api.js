import { iysRequest } from './request';


const ItemSubs = async () => {
    try {
        var responseJson = (await iysRequest(
            {
                categories: ["ItemSubs"],
                tags: [],
                content: {}
            }));
        return responseJson.length ? responseJson[0].content : { ios: [], android: [] };
    } catch (error) {
        return { ios: [], android: [] };

    }

}

const ItemSkus = async () => {
    try {
        var responseJson = (await iysRequest(
            {
                categories: ["ItemSkus"],
                tags: [],
                content: {}
            }));
        return responseJson.length ? responseJson[0].content : { ios: [], android: [] };

    } catch (error) {
        return { ios: [], android: [] };

    }
}

const getAdmobVisible = async (productIds) => {
    try {
        async function get(productId) {
            return (await iysRequest({
                categories: ["AdmobVisible"],
                tags: [productId],
                content: {}
            })).map(item => item.content.value);
        }

        async function getList(productIds2) {
            if (productIds2.length > 1) {
                return (await get(productIds2[0]))
                    .concat(await getList(productIds2.filter((e, i) => i > 0)));
            } else if (productIds2.length) {
                return await get(productIds2[0]);
            } else {
                return [];
            }
        }

        var responseJson = await getList(productIds);

        return responseJson.length > 0 ? !(responseJson.indexOf(false) > -1) : true

    } catch (error) {
        return true

    }
}

export default {
    ItemSubs, ItemSkus, getAdmobVisible
}

