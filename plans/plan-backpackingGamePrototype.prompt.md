# Plan: 1-Month Backpacking Game Prototype

Build a playable prototype using Unity + Firebase demonstrating core backpacking gameplay: node-based map navigation, inventory management, resource tracking, and decision-making events. Focus on validating the core loop rather than polish, with offline-first development and late-stage Firebase integration.

## Steps

1. **Set up Unity project foundation** (Week 1): Create 2D project with organized folder structure (`_Project/Scripts/Core|Data|Gameplay|UI`, `Prefabs/`, `ScriptableObjects/`), install TextMeshPro and Input System, implement `GameManager` singleton, `SaveManager` with local JSON/PlayerPrefs, and define core data structures (Player, Inventory, Location, Item, Event)

2. **Build core gameplay systems** (Week 2): Implement node-based map with 5 locations, travel mechanics consuming resources (Food/Water/Energy), inventory system (8-12 slots, weight limits), event system with 15-20 decision events as ScriptableObjects, and basic UI panels (map, inventory, events, resources)

3. **Create content and balance** (Week 3): Design 20-30 items (food, water, gear), write event choices with meaningful consequences, playtest full loop for 15-30 minute completion time, implement win (reach destination) and lose (resources depleted) conditions, polish UI for clarity

4. **Integrate Firebase and finalize** (Week 4): Add Firebase SDK with anonymous authentication, implement cloud save sync layer over local saves, conduct external testing with 2-3 players, fix critical bugs (crashes, progression blockers), create builds for testing

## Further Considerations

1. **2D vs simple 3D**: Should the map be a 2D illustrated trail map with location nodes, or a simple 3D overview? 2D is faster and fits backpacking theme well.

2. **Core mechanic emphasis**: Which aspect should the prototype validate most—inventory puzzle (packing efficiency), resource management survival, or narrative decision-making? This focuses Week 2-3 development.

3. **Scope flexibility**: If behind schedule by Week 2, would you prefer cutting Firebase integration (local-only prototype) or cutting content quantity (fewer items/events)?
