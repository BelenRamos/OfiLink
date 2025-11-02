/**
 * Convierte un array plano de objetos con referencias a padre (PadreId) en una estructura de árbol.
 * @param {Array<Object>} items - Array de permisos (con Id, PadreId).
 * @param {string} idKey - Clave del ID primario ('Id').
 * @param {string} parentKey - Clave de la referencia al padre ('PadreId').
 * @param {string} childrenKey - Clave para el array de hijos ('hijos').
 * @returns {Array<Object>} El árbol de permisos.
 */
export const arrayToTree = (items, idKey = 'Id', parentKey = 'PadreId', childrenKey = 'hijos') => {
    const map = {};
    const tree = [];

    items.forEach(item => {
        map[item[idKey]] = item;
        item[childrenKey] = [];
    });

    items.forEach(item => {
        if (item[parentKey] !== null && map[item[parentKey]]) {
            map[item[parentKey]][childrenKey].push(item);
        } else {
            tree.push(item);
        }
    });

    return tree;
};