using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Backpacking.Gameplay;

namespace Backpacking.UI
{
    /// <summary>
    /// Displays a single resource (Food, Water, or Energy) with a fill bar and text
    /// </summary>
    public class ResourceBarUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Image fillImage;
        [SerializeField] private TextMeshProUGUI valueText;
        [SerializeField] private TextMeshProUGUI labelText;
        
        [Header("Settings")]
        [SerializeField] private ResourceType resourceType;
        [SerializeField] private Color fullColor = Color.green;
        [SerializeField] private Color lowColor = Color.red;
        [SerializeField] private float lowThreshold = 0.25f;
        
        private ResourceManager resourceManager;
        
        private void Start()
        {
            resourceManager = FindFirstObjectByType<ResourceManager>();
            
            if (resourceManager == null)
            {
                Debug.LogError("[ResourceBarUI] ResourceManager not found!");
                return;
            }
            
            // Set label text
            if (labelText != null)
            {
                labelText.text = resourceType.ToString();
            }
            
            UpdateDisplay();
        }
        
        private void Update()
        {
            UpdateDisplay();
        }
        
        private void UpdateDisplay()
        {
            if (resourceManager == null) return;
            
            float currentValue = 0f;
            float maxValue = 100f;
            
            switch (resourceType)
            {
                case ResourceType.Food:
                    currentValue = resourceManager.CurrentFood;
                    maxValue = resourceManager.MaxFood;
                    break;
                case ResourceType.Water:
                    currentValue = resourceManager.CurrentWater;
                    maxValue = resourceManager.MaxWater;
                    break;
                case ResourceType.Energy:
                    currentValue = resourceManager.CurrentEnergy;
                    maxValue = resourceManager.MaxEnergy;
                    break;
            }
            
            float fillAmount = currentValue / maxValue;
            
            // Update fill image
            if (fillImage != null)
            {
                fillImage.fillAmount = fillAmount;
                fillImage.color = fillAmount <= lowThreshold ? lowColor : fullColor;
            }
            
            // Update text
            if (valueText != null)
            {
                valueText.text = $"{Mathf.RoundToInt(currentValue)} / {Mathf.RoundToInt(maxValue)}";
            }
        }
        
        public enum ResourceType
        {
            Food,
            Water,
            Energy
        }
    }
}
