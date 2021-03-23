import { MODULE_NAME } from "../constants.mjs";

const ITEM_CHANGES_KEY = `${MODULE_NAME}-temp`;

/**
 * Intercepts updates to itemful resources and redirects them to the appropriate owned item
 */
export default function onPreUpdateActor(actor, changes, options, userId) {
    if (!(ITEM_CHANGES_KEY in changes)) return;

    const itemEntries = duplicate(changes[ITEM_CHANGES_KEY]);
    delete changes[ITEM_CHANGES_KEY];

    const actorItems = actor._data.items;
    for (let [itemId, itemChanges] of Object.entries(itemEntries)) {
        const itemIndex = actorItems.findIndex(i => i._id === itemId);
        actorItems[itemIndex] = mergeObject(actorItems[itemIndex], itemChanges, { inplace: false });
    }

    changes.items = actorItems;
}
