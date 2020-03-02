/**
 * Bir liste içinde belirlenen alana göre tekilleştirme işlemi yapılır.
 * @param {Object[]} list Tekilleştirilecek nesne listesidir.
 * @param {Function} field Tekilleştirilecek alandır
 */
export const distinctByField = (list, field) => {
    var temp = list.map(field);
    return list.filter((e, i) => temp.indexOf(field(e)) == i);
}
