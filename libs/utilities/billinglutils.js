import RNIap, {
    acknowledgePurchaseAndroid,
    purchaseUpdatedListener,
    purchaseErrorListener,
} from 'react-native-iap/index';
import { Alert, Platform } from 'react-native';
import { getPriceFromString } from './price';
import BillingList from "../billinglist"
import moment from 'moment';


var billing = { itemSkus: [], itemSubs: [] },
    connection = null;

var billingItemSubsRaw;
var billingItemSkusRaw;

const billinListControl = async () => {
    if (billingItemSubsRaw == null || billingItemSkusRaw == null) {

        billingItemSubsRaw = await BillingList.ItemSubs();
        billingItemSkusRaw = await BillingList.ItemSkus();

        const filter = (list) => {
            return list.filter((x) => x.visible == true).map((item) => item.key);
        }

        if (Platform.OS == "ios") {
            billing.itemSubs = filter(billingItemSubsRaw.ios);
            billing.itemSkus = filter(billingItemSkusRaw.ios);
        } else {
            billing.itemSubs = filter(billingItemSubsRaw.android);
            billing.itemSkus = filter(billingItemSkusRaw.android);
        }
    }
}

const clear = async () => {
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
    await billinListControl();

    var products = [];
    try {
        if (connection == null || connection == undefined)
            await connect();

        products = await RNIap.getProducts(billing.itemSkus);
        return products.sort((x, y) => getPriceFromString(x.localizedPrice) < getPriceFromString(y.localizedPrice) ? -1 : 1);
    } catch (err) {
        return [];
    }
}

async function getSubscriptions() {
    await billinListControl();

    var products = [];
    try {
        if (connection == null || connection == undefined)
            await connect();

        products = await RNIap.getSubscriptions(billing.itemSubs);
        return products.sort((x, y) => getPriceFromString(x.localizedPrice) < getPriceFromString(y.localizedPrice) ? -1 : 1);
    } catch (err) {
        return [];
    }
}

/**
 * Satın alınmış ürünlerin listesinin adlarını dizi olarak getiriyor.
 */
async function getAvailablePurchases() {
    await billinListControl();
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
            if (billing.itemSubs.indexOf(purchase.productId) > -1) {
                restoredTitles.push(purchase.productId);
            } else if (billing.itemSkus.indexOf(purchase.productId) > -1) {
                restoredTitles.push(purchase.productId);
            }
        }

        return restoredTitles;

    } catch (err) {
        Alert.alert("Bağlanamadı", err.message)
        return []
    }

}

async function buy(productId) {
    if (billing.itemSkus.indexOf(productId) > -1) {
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
    buyItem,
    buySubscription,
    getAvailablePurchases,
    clear
}