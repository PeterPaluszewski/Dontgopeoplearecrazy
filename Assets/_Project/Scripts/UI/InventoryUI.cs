using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using Backpacking.Gameplay;
using Backpacking.Data;

namespace Backpacking.UI
{
    /// <summary>
    /// Displays the player's inventory with item slots and weight tracking
    /// </summary>
    public class InventoryUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Transform itemContainer;
        [SerializeField] private GameObject itemSlotPrefab;
        [SerializeField] private TextMeshProUGUI weightText;
        [SerializeField] private Button closeButton;

        [Header("Settings")]
        [SerializeField] private bool hideOnStart = true;

        private InventoryManager inventoryManager;
        private List<GameObject> itemSlots = new List<GameObject>();

        private void Start()
        {
            inventoryManager = FindFirstObjectByType<InventoryManager>();

            if (inventoryManager == null)
            {
                Debug.LogError("[InventoryUI] InventoryManager not found!");
                return;
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(() => gameObject.SetActive(false));
            }

            if (hideOnStart)
            {
                gameObject.SetActive(false);
            }

            RefreshInventory();
        }

        private void OnEnable()
        {
            RefreshInventory();
        }

        public void RefreshInventory()
        {
            if (inventoryManager == null) return;

            // Clear existing slots
            foreach (GameObject slot in itemSlots)
            {
                Destroy(slot);
            }
            itemSlots.Clear();

            // Create new slots for each item
            var items = inventoryManager.GetAllItems();
            foreach (var inventoryItem in items)
            {
                ItemData item = inventoryItem.data;
                int quantity = inventoryItem.quantity;

                GameObject slot = Instantiate(itemSlotPrefab, itemContainer);
                itemSlots.Add(slot);

                // Set up the slot (assuming it has TextMeshProUGUI components)
                TextMeshProUGUI[] texts = slot.GetComponentsInChildren<TextMeshProUGUI>();
                if (texts.Length >= 2)
                {
                    texts[0].text = item.itemName;
                    texts[1].text = $"x{quantity} ({item.weight * quantity:F1}kg)";
                }
            }            // Update weight display
            if (weightText != null)
            {
                weightText.text = $"Weight: {inventoryManager.CurrentWeight:F1} / {inventoryManager.MaxWeight:F1} kg";
            }
        }

        public void Show()
        {
            gameObject.SetActive(true);
            RefreshInventory();
        }

        public void Hide()
        {
            gameObject.SetActive(false);
        }

        public void Toggle()
        {
            if (gameObject.activeSelf)
            {
                Hide();
            }
            else
            {
                Show();
            }
        }
    }
}
