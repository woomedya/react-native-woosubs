import jutore from 'jutore';

const store = jutore.setScope('purchase', {
    purchases: []
});

export const PURCHASES = 'purchases';

export const getPurchases = () => {
    return (store.get(PURCHASES)) || []; 
}

export const set = (value) => {
    store.set(PURCHASES, value || []);
}

export default store;