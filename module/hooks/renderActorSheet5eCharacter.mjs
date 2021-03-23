import { FLAGS, MODULE_NAME } from "../constants.mjs";

const RESOURCE_NAMES = [ "primary", "secondary", "tertiary" ];
const RESOURCE_PARTIAL_PATH = "modules/itemful-resources/templates/resource-partial.hbs";

export default async function onRenderActorSheet5eCharacter(sheet, $html, templateData) {
    const $resources = $html.find("ul.attributes:has(> li.attribute.resource)");
    $resources.addClass("resources");

    const actor = sheet.object;
    let itemfulSlots = actor.getFlag(MODULE_NAME, FLAGS.SLOTS);
    if (!itemfulSlots) return;
    itemfulSlots = duplicate(itemfulSlots);

    // Remove existing resource slots
    $resources.find("> *").remove();

    // Render resource slots for each defined slot in the flag
    for (let [i, slot] of itemfulSlots.entries()) {
        let slotData;
        if (slot.isItem) {
            // this slot is populated by an item, use the item's data to render the template
            const item = actor.items.get(slot.itemId);
            if (!item) {
                console.error(`${MODULE_NAME} | Invalid item id for item resource slot. index: ${i} | itemId: ${slot.itemId}`);
                continue;
            }
            slotData = {
                ...slot,
                label: item.data.name,
                value: item.data.data.uses.value,
                max: parseInt(item.data.data.uses.max), // TODO handle cases where the item uses a non-number max
            }
        } else {
            // ... or fallback to the default resource for this slot to render the template
            const name = RESOURCE_NAMES[i];
            if (!name) {
                console.error(`${MODULE_NAME} | Invalid slot index for non item resource slot. index: ${i}`);
                continue;
            }
            slotData = templateData.data.resources[name];
        }

        const slotElement = await renderTemplate(RESOURCE_PARTIAL_PATH, slotData);
        $resources.append(slotElement);
    }

    // Handle item resource slot links
    $resources.find("a.resource-label.item-link").click(function(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const item = actor.items.get(itemId);
        if (!item) {
            console.error(`${MODULE_NAME} | Can't open item sheet for resource slot, item doesn't exist. data-item-id: ${itemId}`);
            return;
        }
        item.sheet.render(true);
    });
}

/**
 * Data Structure
 * Example 1 - valid
 * flags.itemful-resources.slots = [
 *     {
 *         isItem: false, // resource slot one will fall back to the default (data.data.resources.primary)
 *     },
 *     {
 *         isItem: true, // resource slot two is overridden by an item, defined by itemId
 *         itemId: "j3Vs0e3IZYBTGRik", // the item from which to pull uses
 *     },
 *     // slot three is nonexistent in this example
 * ]
 *
 * Example 2 - valid
 * flags.itemful-resources.slots = [
 *     { isItem: false },
 *     { isItem: false },
 *     { isItem: false }, // first three slots show the default resources
 *     {
 *         isItem: true, // a new resource slot showing an item is added
 *         itemId: "j3Vs0e3IZYBTGRik", // the item from which to pull uses
 *     },
 * ]
 *
 * Example 3 - invalid
 * flags.itemful-resources.slots = [
 *     { isItem: false },
 *     { isItem: false },
 *     { isItem: false },
 *     { isItem: false }, // invalid, characters only have 3 resources
 * ]
 */
