/**
 * Metinler para biriminden arındırılarak sayıya çevirilir.
 * @param str string price
 */
export const getPriceFromString = (str) => {
    return Number(str.replace(/([^0-9,]+)/ig, '').replace(',', '.'));
}