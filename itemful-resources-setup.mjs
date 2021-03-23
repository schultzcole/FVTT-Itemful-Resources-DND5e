import onRenderActorSheet5eCharacter from "./module/hooks/renderActorSheet5eCharacter.mjs";
import onPreUpdateActor from "./module/hooks/preUpdateActor.mjs";

Hooks.on("setup", () => {
    console.log("Itemful Resources | setup");

    Hooks.on("renderActorSheet5eCharacter", onRenderActorSheet5eCharacter);
    Hooks.on("preUpdateActor", onPreUpdateActor);
});
