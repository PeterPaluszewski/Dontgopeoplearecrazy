# Backpacking Game - Unity Setup Guide

## Initial Setup (Week 1 - Days 1-2)

### Step 1: Create Unity Project

1. Open Unity Hub
2. Create **New Project**
3. Select **3D (URP)** or **3D Core** template
4. Name: `Dontgopeoplearecrazy`
5. Location: `c:\Users\peter\code\Dontgopeoplearecrazy`
6. Click **Create Project**

### Step 2: Copy Project Files

The folder structure and core scripts have been created in the `Assets/_Project` directory:

```
Assets/_Project/
├── Scripts/
│   ├── Core/              ✓ GameManager, SaveManager
│   ├── Data/              ✓ ItemData, LocationData, EventData
│   ├── Gameplay/
│   │   ├── Inventory/     ✓ InventoryManager
│   │   ├── Resources/     ✓ ResourceManager
│   │   ├── Travel/        ✓ LocationNode
│   │   └── Events/        (TODO)
│   ├── UI/                (TODO)
│   └── Utilities/         ✓ GlobeHelper
├── Scenes/
├── Prefabs/
├── ScriptableObjects/
└── Art/
```

### Step 3: Install Required Packages

1. Open **Window > Package Manager**
2. Install these packages:
   - **TextMesh Pro** (Built-in, click Import TMP Essentials when prompted)
   - **Input System** (Unity Registry)
   
Optional but recommended:
   - **ProBuilder** (for creating custom globe mesh if needed)

### Step 4: Create Initial Scene Setup

1. **Create Main Scene:**
   - Right-click in `Assets/_Project/Scenes/_Main`
   - Create > Scene
   - Name it `MainGame`
   - Open the scene

2. **Create Game Systems GameObject:**
   - Create Empty GameObject, name it `GameSystems`
   - Add Components:
     - `GameManager` script
     - `SaveManager` script
     - `ResourceManager` script
     - `InventoryManager` script

3. **Create Globe:**
   - Create 3D Object > Sphere
   - Name it `Globe`
   - Set Transform:
     - Position: (0, 0, 0)
     - Scale: (10, 10, 10)
   - Create Material > Name it `GlobeMaterial`
   - Apply to sphere

4. **Setup Camera:**
   - Position Main Camera at: (0, 5, -15)
   - Rotation: (15, 0, 0)
   - Field of View: 40
   - Background: Black or dark blue

### Step 5: Download Globe Texture

1. Go to: https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography
2. Download the **2048x1024** texture
3. Save to: `Assets/_Project/Art/Textures/earth_texture.jpg`
4. Import into Unity
5. Drag onto Globe material

### Step 6: Test Basic Setup

1. Press Play
2. Check Console for initialization messages:
   - `[GameManager] Initializing game systems...`
   
If you see these, the foundation is working!

## What You Have Now

✅ **Project Structure** - Organized folders for all game systems
✅ **Core Systems** - GameManager, SaveManager with auto-save
✅ **Data Structures** - ScriptableObjects for Items, Locations, Events
✅ **Resource Management** - Food, Water, Energy tracking
✅ **Inventory System** - Weight-based inventory with stacking
✅ **Globe Foundation** - Helper utilities for lat/long conversion
✅ **Location Nodes** - Basic node system for the globe

## Next Steps (Week 1 - Days 3-7)

### Day 3: Create Test Content

1. **Create Test Items:**
   - Right-click in `Assets/_Project/ScriptableObjects/Items`
   - Create > Backpacking > Item Data
   - Create these items:
     - Energy Bar (Food: 20, Weight: 0.1kg)
     - Water Bottle (Water: 50, Weight: 1kg)
     - Tent (Equipment, Weight: 2kg)

2. **Create Test Locations:**
   - Right-click in `Assets/_Project/ScriptableObjects/Locations`
   - Create > Backpacking > Location Data
   - Create 3 test locations:
     - Start Location (Lat: 40.7, Long: -74.0) - New York
     - Waypoint (Lat: 51.5, Long: -0.1) - London
     - Destination (Lat: 35.6, Long: 139.7) - Tokyo

### Day 4: Build Globe Visualization

1. Create `GlobeManager` script to:
   - Spawn LocationNode prefabs on globe
   - Draw trails between connected locations
   - Handle globe rotation

2. Create LocationNode prefab:
   - 3D Object > Sphere (scale 0.2)
   - Add `LocationNode` script
   - Add Sphere Collider for clicking
   - Create material with bright color

### Day 5-7: Build Basic UI

1. Create Canvas for game UI
2. Resource bars (Food, Water, Energy)
3. Inventory panel
4. Location info panel
5. Main menu (New Game, Continue, Quit)

## Week 2 Goals

- ✅ Week 1 foundation complete
- Implement travel system (consuming resources over time)
- Create event system with popup UI
- Build 10-15 test events
- Connect locations with LineRenderers
- Test full game loop

## Resources

### Free Assets
- **Globe Texture**: NASA Blue Marble (free)
- **UI Icons**: Kenney.nl (free game assets)
- **Font**: Google Fonts (free)

### Unity Documentation
- [ScriptableObjects](https://docs.unity3d.com/Manual/class-ScriptableObject.html)
- [Input System](https://docs.unity3d.com/Packages/com.unity.inputsystem@latest)
- [TextMesh Pro](https://docs.unity3d.com/Manual/com.unity.textmeshpro.html)

## Troubleshooting

**Problem:** Scripts show errors
- **Solution:** Make sure all scripts are in the correct folders and Unity has compiled them

**Problem:** Globe texture looks wrong
- **Solution:** Make sure texture wrap mode is set to "Repeat" and filter to "Bilinear"

**Problem:** Can't click locations
- **Solution:** LocationNode needs a Collider component

## Development Tips

1. **Test Often** - Press Play frequently to catch issues early
2. **Use Console** - Check Debug.Log messages for system feedback
3. **ScriptableObjects** - Create content in the editor, not in code
4. **Version Control** - Commit after each major feature
5. **Keep It Simple** - Prototype features before polishing

## Questions or Issues?

Refer back to the development plan in `plans/plan-backpackingGamePrototype.prompt.md` for the full timeline and feature breakdown.

Good luck with your backpacking game! 🎒🌍
