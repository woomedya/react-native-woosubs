import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView, Platform, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Linking, Clipboard, Alert } from "react-native";
import { color } from './libs/color';
import { PricingCard, Button } from "react-native-elements";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import purchase from './libs/purchase';
import { distinctByField } from 'woo-utilities/array';
import opts from './config';
import i18n from './libs/locales';
import * as purchaseStore from './libs/stores/Purchases';

const width = Dimensions.get('window').width / 2 - 15;

export const config = ({
    wooServerUrl, publicKey, privateKey, tokenTimeout, lang,
    onChange, policyUrl, primaryColor, locales, deviceId
}) => {
    opts.wooServerUrl = wooServerUrl;
    opts.privateKey = privateKey;
    opts.publicKey = publicKey;
    opts.tokenTimeout = tokenTimeout || opts.tokenTimeout;
    opts.lang = lang;
    opts.policyUrl = policyUrl;
    opts.onChange = onChange;
    opts.primaryColor = primaryColor || opts.primaryColor;
    opts.locales = locales || opts.locales;
    opts.deviceId = deviceId || opts.deviceId;

    getAvailablePurchases();
}

export const purchasesClear = async () => {
    return await purchase.clear();
}

export const setLang = (lang) => {
    opts.lang = lang;
}

export const setPurchase = (purchases) => {
    purchaseStore.set(purchases);
}

const getAvailablePurchases = async () => {
    var availableItems = [];
    try {
        availableItems = await purchase.getAvailablePurchases();

        availableItems = distinctByField(availableItems, x => x);
    } catch (error) {
        availableItems = []
    }
    if (availableItems == undefined)
        availableItems = []

    if (opts.onChange)
        opts.onChange(availableItems);

    return availableItems;
}

export default class BilllingComponent extends Component {
    constructor(props) {
        super(props)
        this.props = props;
        this.state = {
            i18n: i18n(),
            loading: true,
            productList: [],
            availableItems: [],
            purchases: purchaseStore.getPurchases()
        }
    }

    async componentDidMount() {
        this.refresh();

        purchaseStore.default.addListener(purchaseStore.PURCHASES, () => {
			this.setState({
				purchases: purchaseStore.getPurchases()
			})
		})
    }

    refresh = async () => {
        this.setState({
            loading: true,
            productList: [],
            availableItems: [],
        }, async () => {
            await this.getProductList();
            this.getAvailablePurchases();
        });
    }

    getProductList = async () => {
        var productListt;
        try {
            productListt = (await purchase.getItems()).concat(await purchase.getSubscriptions());
            productListt = distinctByField(productListt, x => x.productId)
        } catch (error) {
            productListt = []
        }

        this.setState({
            productList: productListt,
            availableItems: productListt.length ?  this.state.purchases || [] : [],
        });
    }

    getAvailablePurchases = async () => {
        var availableItems = await getAvailablePurchases();
        availableItems = availableItems.concat(this.state.purchases || []);

        await new Promise(res => {
            this.setState({
                availableItems,
                loading: false
            }, res);
        });
    }

    buy = async (item) => {
        await purchase.buy(item.productId);
        await this.getAvailablePurchases();
    }

    cancel = () => {
        if (Platform.OS == "ios") {
            const majorVersionIOS = parseInt(Platform.Version, 10);
            if (majorVersionIOS <= 12)
                Linking.openURL('https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions')
            else
                Linking.openURL('https://apps.apple.com/account/subscriptions')
        }
        else
            Linking.openURL('https://play.google.com/store/account/subscriptions?package=' + deviceinfo.getApplicationName());
    }

    openPrivacyPolicy = () => {
        Linking.openURL(opts.policyUrl);
    };

    copyDeviceId = () => {
        Clipboard.setString(opts.deviceId);
        // alert(this.state.i18n.copied);
        Alert.alert(
            this.state.i18n.copiedTitle,
            this.state.i18n.copied,
            [
                { text: this.state.i18n.ok  },
            ],
        );
    }

    renderItem = ({ item }) => {
        return <View style={styles.contetn}>
            <View style={[styles.root]}>
                <PricingCard
                    color={opts.primaryColor}
                    title={item.title}
                    price={item.localizedPrice}
                    info={[item.description]}
                    titleStyle={{ fontSize: 20, }}
                    pricingStyle={{ fontSize: 22 }}
                    containerStyle={styles.pricingCard}
                    button={{ title: this.state.i18n.select, icon: 'payment' }}
                    onButtonPress={() => this.buy(item)}
                />
            </View>
        </View>
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={{ alignSelf: 'stretch', }}  >
                    <View style={styles.containerBody}>
                        <View style={styles.headerRow}>
                            <View style={styles.rowHeader}>
                                <TouchableOpacity onPress={this.openPrivacyPolicy}>
                                    <Text style={styles.rowHeaderText}>{this.state.i18n.policy}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.refresh}>
                                    <Text style={styles.rowHeaderText}>{this.state.i18n.refresh}</Text>
                                </TouchableOpacity>
                            </View>
                            <Icon name={this.state.availableItems.length > 0 ? "star" : "star-off"} color={color.SUN_FLOWER} style={styles.star} />
                            {
                                this.state.availableItems.length == 0 && this.state.loading == false ?
                                    <Text>{this.state.i18n.standartAbone}</Text> :
                                    this.state.availableItems.filter((x, i) => this.state.availableItems.indexOf(x) == i).map(type => {
                                        return <Text key={type}>{this.state.productList.find(x => x.productId == type).title}</Text>
                                    })
                            }
                            {
                                this.state.availableItems.length == 0 ?
                                    this.state.loading ?
                                        <View>
                                            <Text style={{ marginBottom: 10 }}>{this.state.i18n.loading}</Text>
                                            <ActivityIndicator size="small" color={color.SILVER} />
                                        </View>
                                        : null
                                    : <View style={{ marginTop: 10 }}>
                                        <Button icon={{ name: "payment", size: 15, color: "white" }}
                                            onPress={this.cancel}
                                            buttonStyle={{ paddingHorizontal: 15, backgroundColor: opts.primaryColor }}
                                            title={this.state.i18n.yonetbuton}
                                        />
                                    </View>
                            }
                            <Text style={styles.rule}>{this.state.i18n.rule}</Text>
                            <View style={styles.deviceIdContainer}>
                                <Text style={styles.deviceId} onPress={this.copyDeviceId} >{this.state.i18n.copyDeviceId}</Text>
                                <Icon name={"content-copy"} 
                                        color={color.BLACK} 
                                        style={styles.copyDeviceId}
                                        onPress={this.copyDeviceId}
                                        />
                            </View>
                        </View>
                    </View>

                    <FlatList
                        style={{ flex: 1, left: 7 }}
                        data={this.state.productList.filter(p => this.state.availableItems.indexOf(p.productId) == -1)}
                        renderItem={this.renderItem}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />

                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.select({
            ios: 0,
            android: 5,
        }),
        paddingTop: Platform.select({
            ios: 0,
            android: 5,
        }),
        backgroundColor: 'white',
    },
    containerBody: { padding: 10, flex: 1, justifyContent: "center", flexDirection: "row", },
    headerRow: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: color.WHITE,
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        elevation: 3,
        borderRadius: 2,
        borderColor: "#CCC",
        borderWidth: 1,
        shadowOffset: {
            height: 2,
            width: -2
        },
        shadowColor: color.BLACK,
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        overflow: "hidden",
    },
    star: { fontSize: 50, marginBottom: 10 },
    contetn: {
        marginHorizontal: 4,
        marginBottom: 7,
        width: width,
        elevation: 3,
    },
    root: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: color.WHITE,
        elevation: 3,
        borderRadius: 2,
        borderColor: "#CCC",
        borderWidth: 1,
        shadowOffset: {
            height: 2,
            width: -2
        },
        shadowColor: color.BLACK,
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        overflow: "hidden"
    },
    pricingCard: {
        elevation: 0,
        borderColor: color.TRANSPARENT,
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0, //default is 1
        shadowRadius: 0,//default is 1
        padding: 0,
    },
    rule: { fontSize: 10, top: 10, textAlign: "justify" },
    deviceId: { fontSize: 10, paddingTop: 5, paddingBottom: 10, textAlign: "left" },
    deviceIdContainer: { top: 20, width: "100%", flexDirection: "row", justifyContent: "flex-start", textAlign: "left" },
    copyDeviceId: { marginLeft: 5, fontSize: 20 },
    rowHeader: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
    rowHeaderText: { fontSize: 10, },
});