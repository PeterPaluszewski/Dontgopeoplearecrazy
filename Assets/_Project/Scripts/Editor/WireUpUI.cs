using UnityEngine;
using UnityEditor;
using UnityEngine.UI;
using Backpacking.UI;

namespace Backpacking.Editor
{
    public class WireUpUI
    {
        [MenuItem("Backpacking/Wire Up UI References")]
        public static void WireUpUIReferences()
        {
            // Find MainMenu and wire it up
            MainMenuUI mainMenu = GameObject.FindFirstObjectByType<MainMenuUI>();
            if (mainMenu != null)
            {
                // Find buttons by name
                Transform mainMenuTransform = mainMenu.transform;

                Button newGameBtn = FindChildByName(mainMenuTransform, "NewGameButton")?.GetComponent<Button>();
                Button continueBtn = FindChildByName(mainMenuTransform, "ContinueButton")?.GetComponent<Button>();
                Button quitBtn = FindChildByName(mainMenuTransform, "QuitButton")?.GetComponent<Button>();

                SerializedObject so = new SerializedObject(mainMenu);
                so.FindProperty("newGameButton").objectReferenceValue = newGameBtn;
                so.FindProperty("continueButton").objectReferenceValue = continueBtn;
                so.FindProperty("quitButton").objectReferenceValue = quitBtn;

                // Find HUD as gameplay UI reference
                Transform canvas = mainMenu.transform.parent;
                Transform hud = canvas.Find("HUD");
                so.FindProperty("gameplayUI").objectReferenceValue = hud?.gameObject;

                so.ApplyModifiedProperties();
                EditorUtility.SetDirty(mainMenu);
                Debug.Log("✅ MainMenuUI wired up!");
            }

            // Find and wire up ResourceBars
            ResourceBarUI[] resourceBars = GameObject.FindObjectsOfType<ResourceBarUI>();
            foreach (var bar in resourceBars)
            {
                SerializedObject so = new SerializedObject(bar);
                Transform barTransform = bar.transform;

                // Find child UI elements
                var fillImage = FindChildByName(barTransform, "Fill")?.GetComponent<Image>();
                var valueText = FindChildByName(barTransform, "Value")?.GetComponent<TMPro.TextMeshProUGUI>();
                var labelText = FindChildByName(barTransform, "Label")?.GetComponent<TMPro.TextMeshProUGUI>();

                so.FindProperty("fillImage").objectReferenceValue = fillImage;
                so.FindProperty("valueText").objectReferenceValue = valueText;
                so.FindProperty("labelText").objectReferenceValue = labelText;

                // Set resource type based on name
                if (bar.name.Contains("Food"))
                    so.FindProperty("resourceType").enumValueIndex = 0;
                else if (bar.name.Contains("Water"))
                    so.FindProperty("resourceType").enumValueIndex = 1;
                else if (bar.name.Contains("Energy"))
                    so.FindProperty("resourceType").enumValueIndex = 2;

                so.ApplyModifiedProperties();
                EditorUtility.SetDirty(bar);
            }
            Debug.Log($"✅ {resourceBars.Length} ResourceBars wired up!");

            // Find and wire up InventoryUI
            InventoryUI inventoryUI = GameObject.FindFirstObjectByType<InventoryUI>();
            if (inventoryUI != null)
            {
                SerializedObject so = new SerializedObject(inventoryUI);
                Transform invTransform = inventoryUI.transform;

                Transform scrollView = FindChildByName(invTransform, "ScrollView");
                Transform content = scrollView != null ? FindChildByName(scrollView, "Content") : null;
                var weightText = FindChildByName(invTransform, "WeightText")?.GetComponent<TMPro.TextMeshProUGUI>();
                var closeBtn = FindChildByName(invTransform, "CloseButton")?.GetComponent<Button>();

                so.FindProperty("itemContainer").objectReferenceValue = content;
                so.FindProperty("weightText").objectReferenceValue = weightText;
                so.FindProperty("closeButton").objectReferenceValue = closeBtn;

                // Load the item slot prefab
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Prefabs/UI/ItemSlot.prefab");
                so.FindProperty("itemSlotPrefab").objectReferenceValue = prefab;

                so.ApplyModifiedProperties();
                EditorUtility.SetDirty(inventoryUI);
                Debug.Log("✅ InventoryUI wired up!");
            }

            // Find and wire up LocationInfoUI
            LocationInfoUI locationInfoUI = GameObject.FindFirstObjectByType<LocationInfoUI>();
            if (locationInfoUI != null)
            {
                SerializedObject so = new SerializedObject(locationInfoUI);
                Transform locTransform = locationInfoUI.transform;

                var nameText = FindChildByName(locTransform, "LocationName")?.GetComponent<TMPro.TextMeshProUGUI>();
                var descText = FindChildByName(locTransform, "Description")?.GetComponent<TMPro.TextMeshProUGUI>();
                var coordText = FindChildByName(locTransform, "Coordinates")?.GetComponent<TMPro.TextMeshProUGUI>();
                var travelBtn = FindChildByName(locTransform, "TravelButton")?.GetComponent<Button>();
                var closeBtn = FindChildByName(locTransform, "CloseButton")?.GetComponent<Button>();

                so.FindProperty("locationNameText").objectReferenceValue = nameText;
                so.FindProperty("descriptionText").objectReferenceValue = descText;
                so.FindProperty("coordinatesText").objectReferenceValue = coordText;
                so.FindProperty("travelButton").objectReferenceValue = travelBtn;
                so.FindProperty("closeButton").objectReferenceValue = closeBtn;

                so.ApplyModifiedProperties();
                EditorUtility.SetDirty(locationInfoUI);
                Debug.Log("✅ LocationInfoUI wired up!");
            }

            Debug.Log("✅✅✅ All UI elements wired up successfully!");
        }

        private static Transform FindChildByName(Transform parent, string name)
        {
            if (parent.name == name)
                return parent;

            foreach (Transform child in parent)
            {
                Transform result = FindChildByName(child, name);
                if (result != null)
                    return result;
            }

            return null;
        }
    }
}
