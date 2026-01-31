using UnityEngine;
using UnityEditor;
using TMPro;
using UnityEngine.UI;

namespace Backpacking.Editor
{
    public class CreateUIElements
    {
        [MenuItem("Backpacking/Create UI/Complete Game UI")]
        public static void CreateCompleteUI()
        {
            // Create main Canvas
            GameObject canvasObj = new GameObject("GameCanvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            
            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;
            
            canvasObj.AddComponent<GraphicRaycaster>();
            
            // Create EventSystem if it doesn't exist
            if (GameObject.FindFirstObjectByType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                GameObject eventSystemObj = new GameObject("EventSystem");
                eventSystemObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
                eventSystemObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }
            
            // Create HUD (Resource Bars)
            CreateHUD(canvasObj.transform);
            
            // Create Inventory Panel
            CreateInventoryPanel(canvasObj.transform);
            
            // Create Location Info Panel
            CreateLocationInfoPanel(canvasObj.transform);
            
            // Create Main Menu
            CreateMainMenu(canvasObj.transform);
            
            Debug.Log("✅ Complete Game UI created successfully!");
            Selection.activeGameObject = canvasObj;
        }
        
        private static void CreateHUD(Transform parent)
        {
            GameObject hudPanel = new GameObject("HUD");
            RectTransform hudRect = hudPanel.AddComponent<RectTransform>();
            hudRect.SetParent(parent);
            hudRect.anchorMin = new Vector2(0, 1);
            hudRect.anchorMax = new Vector2(0, 1);
            hudRect.pivot = new Vector2(0, 1);
            hudRect.anchoredPosition = new Vector2(20, -20);
            hudRect.sizeDelta = new Vector2(300, 200);
            
            // Create 3 resource bars (Food, Water, Energy)
            string[] resources = { "Food", "Water", "Energy" };
            for (int i = 0; i < 3; i++)
            {
                CreateResourceBar(hudRect, resources[i], i);
            }
        }
        
        private static void CreateResourceBar(RectTransform parent, string resourceName, int index)
        {
            GameObject barObj = new GameObject($"{resourceName}Bar");
            RectTransform barRect = barObj.AddComponent<RectTransform>();
            barRect.SetParent(parent);
            barRect.anchorMin = new Vector2(0, 1);
            barRect.anchorMax = new Vector2(1, 1);
            barRect.pivot = new Vector2(0, 1);
            barRect.anchoredPosition = new Vector2(0, -60 * index);
            barRect.sizeDelta = new Vector2(0, 50);
            
            // Background
            GameObject bgObj = new GameObject("Background");
            RectTransform bgRect = bgObj.AddComponent<RectTransform>();
            bgRect.SetParent(barRect);
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            Image bgImage = bgObj.AddComponent<Image>();
            bgImage.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);
            
            // Fill
            GameObject fillObj = new GameObject("Fill");
            RectTransform fillRect = fillObj.AddComponent<RectTransform>();
            fillRect.SetParent(barRect);
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = new Vector2(1, 1);
            fillRect.offsetMin = new Vector2(5, 5);
            fillRect.offsetMax = new Vector2(-5, -25);
            Image fillImage = fillObj.AddComponent<Image>();
            fillImage.color = Color.green;
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;
            
            // Label
            GameObject labelObj = new GameObject("Label");
            RectTransform labelRect = labelObj.AddComponent<RectTransform>();
            labelRect.SetParent(barRect);
            labelRect.anchorMin = new Vector2(0, 1);
            labelRect.anchorMax = new Vector2(0, 1);
            labelRect.pivot = new Vector2(0, 1);
            labelRect.anchoredPosition = new Vector2(10, -5);
            labelRect.sizeDelta = new Vector2(100, 20);
            TextMeshProUGUI labelText = labelObj.AddComponent<TextMeshProUGUI>();
            labelText.text = resourceName;
            labelText.fontSize = 14;
            labelText.color = Color.white;
            
            // Value
            GameObject valueObj = new GameObject("Value");
            RectTransform valueRect = valueObj.AddComponent<RectTransform>();
            valueRect.SetParent(barRect);
            valueRect.anchorMin = new Vector2(1, 0);
            valueRect.anchorMax = new Vector2(1, 0);
            valueRect.pivot = new Vector2(1, 0);
            valueRect.anchoredPosition = new Vector2(-10, 5);
            valueRect.sizeDelta = new Vector2(100, 20);
            TextMeshProUGUI valueText = valueObj.AddComponent<TextMeshProUGUI>();
            valueText.text = "100 / 100";
            valueText.fontSize = 12;
            valueText.color = Color.white;
            valueText.alignment = TextAlignmentOptions.Right;
            
            // Add ResourceBarUI script
            var resourceBarUI = barObj.AddComponent<Backpacking.UI.ResourceBarUI>();
            // Use reflection to set private fields
            var type = resourceBarUI.GetType();
            type.GetField("fillImage", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.SetValue(resourceBarUI, fillImage);
            type.GetField("valueText", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.SetValue(resourceBarUI, valueText);
            type.GetField("labelText", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.SetValue(resourceBarUI, labelText);
        }
        
        private static void CreateInventoryPanel(Transform parent)
        {
            GameObject panelObj = new GameObject("InventoryPanel");
            RectTransform panelRect = panelObj.AddComponent<RectTransform>();
            panelRect.SetParent(parent);
            panelRect.anchorMin = new Vector2(0.5f, 0.5f);
            panelRect.anchorMax = new Vector2(0.5f, 0.5f);
            panelRect.pivot = new Vector2(0.5f, 0.5f);
            panelRect.anchoredPosition = Vector2.zero;
            panelRect.sizeDelta = new Vector2(600, 800);
            
            Image panelImage = panelObj.AddComponent<Image>();
            panelImage.color = new Color(0.1f, 0.1f, 0.1f, 0.95f);
            
            // Title
            GameObject titleObj = new GameObject("Title");
            RectTransform titleRect = titleObj.AddComponent<RectTransform>();
            titleRect.SetParent(panelRect);
            titleRect.anchorMin = new Vector2(0, 1);
            titleRect.anchorMax = new Vector2(1, 1);
            titleRect.pivot = new Vector2(0.5f, 1);
            titleRect.anchoredPosition = new Vector2(0, -20);
            titleRect.sizeDelta = new Vector2(-40, 40);
            TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
            titleText.text = "Inventory";
            titleText.fontSize = 24;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = Color.white;
            
            // Weight Display
            GameObject weightObj = new GameObject("WeightText");
            RectTransform weightRect = weightObj.AddComponent<RectTransform>();
            weightRect.SetParent(panelRect);
            weightRect.anchorMin = new Vector2(0, 0);
            weightRect.anchorMax = new Vector2(1, 0);
            weightRect.pivot = new Vector2(0.5f, 0);
            weightRect.anchoredPosition = new Vector2(0, 60);
            weightRect.sizeDelta = new Vector2(-40, 30);
            TextMeshProUGUI weightText = weightObj.AddComponent<TextMeshProUGUI>();
            weightText.text = "Weight: 0 / 20 kg";
            weightText.fontSize = 16;
            weightText.alignment = TextAlignmentOptions.Center;
            weightText.color = Color.yellow;
            
            // Scroll View
            GameObject scrollObj = new GameObject("ScrollView");
            RectTransform scrollRect = scrollObj.AddComponent<RectTransform>();
            scrollRect.SetParent(panelRect);
            scrollRect.anchorMin = new Vector2(0, 0);
            scrollRect.anchorMax = new Vector2(1, 1);
            scrollRect.offsetMin = new Vector2(20, 100);
            scrollRect.offsetMax = new Vector2(-20, -80);
            
            ScrollRect scroll = scrollObj.AddComponent<ScrollRect>();
            scrollObj.AddComponent<Image>().color = new Color(0.05f, 0.05f, 0.05f, 1f);
            
            // Viewport
            GameObject viewportObj = new GameObject("Viewport");
            RectTransform viewportRect = viewportObj.AddComponent<RectTransform>();
            viewportRect.SetParent(scrollRect);
            viewportRect.anchorMin = Vector2.zero;
            viewportRect.anchorMax = Vector2.one;
            viewportRect.offsetMin = Vector2.zero;
            viewportRect.offsetMax = Vector2.zero;
            viewportObj.AddComponent<RectMask2D>();
            
            // Content
            GameObject contentObj = new GameObject("Content");
            RectTransform contentRect = contentObj.AddComponent<RectTransform>();
            contentRect.SetParent(viewportRect);
            contentRect.anchorMin = new Vector2(0, 1);
            contentRect.anchorMax = new Vector2(1, 1);
            contentRect.pivot = new Vector2(0.5f, 1);
            contentRect.anchoredPosition = Vector2.zero;
            contentRect.sizeDelta = new Vector2(0, 400);
            
            VerticalLayoutGroup layout = contentObj.AddComponent<VerticalLayoutGroup>();
            layout.childControlHeight = false;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            layout.spacing = 10;
            layout.padding = new RectOffset(10, 10, 10, 10);
            
            ContentSizeFitter fitter = contentObj.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            
            scroll.content = contentRect;
            scroll.viewport = viewportRect;
            scroll.vertical = true;
            scroll.horizontal = false;
            
            // Close Button
            CreateButton(panelRect, "CloseButton", "Close", new Vector2(0, -20), new Vector2(150, 40));
            
            // Add InventoryUI script
            panelObj.AddComponent<Backpacking.UI.InventoryUI>();
            
            // Create item slot prefab
            CreateItemSlotPrefab(contentRect);
        }
        
        private static void CreateItemSlotPrefab(RectTransform parent)
        {
            GameObject slotObj = new GameObject("ItemSlotPrefab");
            RectTransform slotRect = slotObj.AddComponent<RectTransform>();
            slotRect.SetParent(parent);
            slotRect.sizeDelta = new Vector2(0, 60);
            
            Image slotImage = slotObj.AddComponent<Image>();
            slotImage.color = new Color(0.2f, 0.2f, 0.2f, 1f);
            
            // Item Name
            GameObject nameObj = new GameObject("ItemName");
            RectTransform nameRect = nameObj.AddComponent<RectTransform>();
            nameRect.SetParent(slotRect);
            nameRect.anchorMin = new Vector2(0, 0.5f);
            nameRect.anchorMax = new Vector2(0, 0.5f);
            nameRect.pivot = new Vector2(0, 0.5f);
            nameRect.anchoredPosition = new Vector2(15, 0);
            nameRect.sizeDelta = new Vector2(300, 30);
            TextMeshProUGUI nameText = nameObj.AddComponent<TextMeshProUGUI>();
            nameText.text = "Item Name";
            nameText.fontSize = 18;
            nameText.color = Color.white;
            
            // Quantity/Weight
            GameObject infoObj = new GameObject("ItemInfo");
            RectTransform infoRect = infoObj.AddComponent<RectTransform>();
            infoRect.SetParent(slotRect);
            infoRect.anchorMin = new Vector2(1, 0.5f);
            infoRect.anchorMax = new Vector2(1, 0.5f);
            infoRect.pivot = new Vector2(1, 0.5f);
            infoRect.anchoredPosition = new Vector2(-15, 0);
            infoRect.sizeDelta = new Vector2(200, 30);
            TextMeshProUGUI infoText = infoObj.AddComponent<TextMeshProUGUI>();
            infoText.text = "x1 (0.5kg)";
            infoText.fontSize = 14;
            infoText.alignment = TextAlignmentOptions.Right;
            infoText.color = Color.gray;
            
            // Save as prefab
            string prefabPath = "Assets/_Project/Prefabs/UI/ItemSlot.prefab";
            if (!AssetDatabase.IsValidFolder("Assets/_Project/Prefabs/UI"))
            {
                AssetDatabase.CreateFolder("Assets/_Project/Prefabs", "UI");
            }
            
            PrefabUtility.SaveAsPrefabAsset(slotObj, prefabPath);
            Object.DestroyImmediate(slotObj);
        }
        
        private static void CreateLocationInfoPanel(Transform parent)
        {
            GameObject panelObj = new GameObject("LocationInfoPanel");
            RectTransform panelRect = panelObj.AddComponent<RectTransform>();
            panelRect.SetParent(parent);
            panelRect.anchorMin = new Vector2(1, 0.5f);
            panelRect.anchorMax = new Vector2(1, 0.5f);
            panelRect.pivot = new Vector2(1, 0.5f);
            panelRect.anchoredPosition = new Vector2(-20, 0);
            panelRect.sizeDelta = new Vector2(400, 500);
            
            Image panelImage = panelObj.AddComponent<Image>();
            panelImage.color = new Color(0.1f, 0.1f, 0.1f, 0.95f);
            
            // Title
            GameObject nameObj = CreateText(panelRect, "LocationName", "Location Name", 24, new Vector2(0, -30));
            
            // Coordinates
            GameObject coordObj = CreateText(panelRect, "Coordinates", "Lat: 0.00°, Long: 0.00°", 14, new Vector2(0, -70));
            coordObj.GetComponent<TextMeshProUGUI>().color = Color.gray;
            
            // Description
            GameObject descObj = new GameObject("Description");
            RectTransform descRect = descObj.AddComponent<RectTransform>();
            descRect.SetParent(panelRect);
            descRect.anchorMin = new Vector2(0, 0);
            descRect.anchorMax = new Vector2(1, 1);
            descRect.offsetMin = new Vector2(20, 120);
            descRect.offsetMax = new Vector2(-20, -100);
            TextMeshProUGUI descText = descObj.AddComponent<TextMeshProUGUI>();
            descText.text = "Location description goes here...";
            descText.fontSize = 16;
            descText.alignment = TextAlignmentOptions.TopLeft;
            descText.color = Color.white;
            
            // Travel Button
            GameObject travelBtn = CreateButton(panelRect, "TravelButton", "Travel Here", new Vector2(0, 60), new Vector2(200, 50));
            
            // Close Button
            CreateButton(panelRect, "CloseButton", "Close", new Vector2(0, 10), new Vector2(150, 40));
            
            // Add LocationInfoUI script
            panelObj.AddComponent<Backpacking.UI.LocationInfoUI>();
        }
        
        private static void CreateMainMenu(Transform parent)
        {
            GameObject menuObj = new GameObject("MainMenu");
            RectTransform menuRect = menuObj.AddComponent<RectTransform>();
            menuRect.SetParent(parent);
            menuRect.anchorMin = Vector2.zero;
            menuRect.anchorMax = Vector2.one;
            menuRect.offsetMin = Vector2.zero;
            menuRect.offsetMax = Vector2.zero;
            
            Image menuImage = menuObj.AddComponent<Image>();
            menuImage.color = new Color(0.05f, 0.05f, 0.05f, 1f);
            
            // Title
            GameObject titleObj = CreateText(menuRect, "Title", "DON'T GO\nPEOPLE ARE CRAZY", 48, new Vector2(0, 200));
            titleObj.GetComponent<TextMeshProUGUI>().alignment = TextAlignmentOptions.Center;
            
            // Buttons
            CreateButton(menuRect, "NewGameButton", "New Game", new Vector2(0, 50), new Vector2(300, 60));
            CreateButton(menuRect, "ContinueButton", "Continue", new Vector2(0, -30), new Vector2(300, 60));
            CreateButton(menuRect, "QuitButton", "Quit", new Vector2(0, -110), new Vector2(300, 60));
            
            // Add MainMenuUI script
            menuObj.AddComponent<Backpacking.UI.MainMenuUI>();
        }
        
        private static GameObject CreateText(RectTransform parent, string name, string text, int fontSize, Vector2 position)
        {
            GameObject textObj = new GameObject(name);
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.SetParent(parent);
            textRect.anchorMin = new Vector2(0.5f, 1);
            textRect.anchorMax = new Vector2(0.5f, 1);
            textRect.pivot = new Vector2(0.5f, 1);
            textRect.anchoredPosition = position;
            textRect.sizeDelta = new Vector2(360, fontSize + 10);
            
            TextMeshProUGUI tmp = textObj.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = fontSize;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
            
            return textObj;
        }
        
        private static GameObject CreateButton(RectTransform parent, string name, string text, Vector2 position, Vector2 size)
        {
            GameObject btnObj = new GameObject(name);
            RectTransform btnRect = btnObj.AddComponent<RectTransform>();
            btnRect.SetParent(parent);
            btnRect.anchorMin = new Vector2(0.5f, 0);
            btnRect.anchorMax = new Vector2(0.5f, 0);
            btnRect.pivot = new Vector2(0.5f, 0);
            btnRect.anchoredPosition = position;
            btnRect.sizeDelta = size;
            
            Image btnImage = btnObj.AddComponent<Image>();
            btnImage.color = new Color(0.3f, 0.5f, 0.7f, 1f);
            
            Button btn = btnObj.AddComponent<Button>();
            btn.targetGraphic = btnImage;
            
            GameObject textObj = new GameObject("Text");
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.SetParent(btnRect);
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            
            TextMeshProUGUI tmp = textObj.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = 20;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
            
            return btnObj;
        }
    }
}
