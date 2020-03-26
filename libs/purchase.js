import RNIap, {
    acknowledgePurchaseAndroid,
    purchaseUpdatedListener,
} from 'react-native-iap/index';
import { Platform } from 'react-native';
import { getPriceFromString } from 'woo-utilities/price';
import woosubsApi from "./api";
import moment from 'moment';

var purchaseList = { itemSkus: [], itemSubs: [] },
    connection = null;

var purchaseSubsRawList;
var purchaseSkusRawList;

const purchaseListControl = async () => {
    if (purchaseSubsRawList == null || purchaseSkusRawList == null) {

        purchaseSubsRawList = await woosubsApi.getSubItems();
        purchaseSkusRawList = await woosubsApi.getSkuItems();

        const filter = (list) => {
            return list.filter((x) => x.visible == true).map((item) => item.key);
        }

        purchaseList.itemSubs = filter(purchaseSubsRawList);
        purchaseList.itemSkus = filter(purchaseSkusRawList);
    }
}
async function clear() {
    if (connection == null || connection == undefined)
        await connect();

    await RNIap.consumeAllItemsAndroid();//Android Alınan Ürünleri Temizleme
    await RNIap.clearProductsIOS()	//IOS Alınan Ürünleri Temizleme
}

const connect = async () => {
    if (Platform.OS == "ios") {
        try {
            await RNIap.getReceiptIOS();
        } catch (err) {
            // error yönetimi yapılabilir
        }
    }

    connection = await RNIap.initConnection();
    acknowledgePurchase();
    return connection;
}

/**
 * Satın alınabilecek ürünlerin listesini map olarak getiriyor böylelikle içinden gerçek veriler çekilebiliyor
 */
async function getItems() {
    await purchaseListControl();

    var products = [];
    try {
        if (connection == null || connection == undefined)
            await connect();

        products = await RNIap.getProducts(purchaseList.itemSkus);
        return products.sort((x, y) => getPriceFromString(x.localizedPrice) < getPriceFromString(y.localizedPrice) ? -1 : 1);
    } catch (err) {
        return [];
    }
}

async function getSubscriptions() {
    await purchaseListControl();

    var products = [];
    try {
        if (connection == null || connection == undefined)
            await connect();

        products = await RNIap.getSubscriptions(purchaseList.itemSubs);
        return products.sort((x, y) => getPriceFromString(x.localizedPrice) < getPriceFromString(y.localizedPrice) ? -1 : 1);
    } catch (err) {
        return [];
    }
}

/**
 * Satın alınmış ürünlerin listesinin adlarını dizi olarak getiriyor.
 */
async function getAvailablePurchases() {
    await purchaseListControl();
    var restoredTitles = [];
    try {
        if (connection == null || connection == undefined)
            await connect();

        var purchases;
        purchases = await RNIap.getAvailablePurchases();

        if (Platform.OS == "ios") {
            purchases = purchases.filter((purchase) => {
                return new Date().toISOString() < moment(new Date(purchase.transactionDate)).add(1, 'M').toISOString();
            });
        }

        for (let index = 0; index < purchases.length; index++) {
            var purchase = purchases[index]
            if (purchaseList.itemSubs.indexOf(purchase.productId) > -1) {
                restoredTitles.push(purchase.productId);
            } else if (purchaseList.itemSkus.indexOf(purchase.productId) > -1) {
                restoredTitles.push(purchase.productId);
            }
        }

        return restoredTitles;

    } catch (err) {
        return []
    }

}

async function buy(productId) {
    if (purchaseList.itemSkus.indexOf(productId) > -1) {
        await buyItem(productId);
    } else {
        await buySubscription(productId);
    }
}

/**
 * Satın alımını yapacak function. 
 * @param sku Satın alanacak sku id.
 */
async function buyItem(sku) {
    try {
        if (connection == null || connection == undefined)
            await connect();

        if (Platform.OS == "ios") {
            try {
                await RNIap.getReceiptIOS();
            } catch (err) {

            }
        }
        const purchase = await RNIap.requestPurchase(sku, false)
        return purchase
    } catch (err) {
        return null
    }
}

const buySubscription = async (sku) => {
    try {
        if (connection == null || connection == undefined)
            await connect();

        if (Platform.OS == "ios") {
            try {
                await RNIap.getReceiptIOS();
            } catch (err) {

            }
        }
        const purchase = RNIap.requestSubscription(sku, false);
        return purchase;
    } catch (err) {
        return null
    }
}

const acknowledgePurchase = () => {
    if (connection !== null || connection !== undefined) {
        purchaseUpdatedListener(async (purchase) => {
            if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
                try {
                    await acknowledgePurchaseAndroid(purchase.purchaseToken);
                } catch (err) {
                    // error yönetimi yapılabilir
                }
            }
        });
    }
}

/**
 * Billling kontrol işlemlerini burda yapıyoruz.
 */
export default {
    getItems,
    getSubscriptions,
    buy,
    getAvailablePurchases,
    clear
}