using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using Backpacking.Data;

namespace Backpacking.Gameplay
{
    /// <summary>
    /// Manages the player's inventory
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        public static InventoryManager Instance { get; private set; }

        [Header("Inventory Settings")]
        [SerializeField] private int maxSlots = 12;
        [SerializeField] private float maxWeight = 20f; // kg

        private List<InventoryItem> items = new List<InventoryItem>();

        public int MaxSlots => maxSlots;
        public float MaxWeight => maxWeight;
        public float CurrentWeight => items.Sum(item => item.data.weight * item.quantity);
        public int UsedSlots => items.Count;

        // Events
        public System.Action OnInventoryChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public bool AddItem(ItemData itemData, int quantity = 1)
        {
            if (itemData == null)
            {
                Debug.LogWarning("[Inventory] Attempted to add null item");
                return false;
            }

            // Check if item can stack with existing
            if (itemData.maxStackSize > 1)
            {
                InventoryItem existingItem = items.FirstOrDefault(i => i.data == itemData);
                if (existingItem != null)
                {
                    int spaceLeft = itemData.maxStackSize - existingItem.quantity;
                    int toAdd = Mathf.Min(quantity, spaceLeft);
                    
                    if (toAdd > 0)
                    {
                        existingItem.quantity += toAdd;
                        quantity -= toAdd;
                        OnInventoryChanged?.Invoke();
                    }
                    
                    if (quantity == 0)
                        return true;
                }
            }

            // Check slots and weight
            if (UsedSlots >= maxSlots)
            {
                Debug.LogWarning("[Inventory] No free slots!");
                return false;
            }

            float newWeight = itemData.weight * quantity;
            if (CurrentWeight + newWeight > maxWeight)
            {
                Debug.LogWarning("[Inventory] Too heavy!");
                return false;
            }

            // Add new item
            items.Add(new InventoryItem { data = itemData, quantity = quantity });
            OnInventoryChanged?.Invoke();
            Debug.Log($"[Inventory] Added {quantity}x {itemData.itemName}");
            return true;
        }

        public bool RemoveItem(ItemData itemData, int quantity = 1)
        {
            InventoryItem item = items.FirstOrDefault(i => i.data == itemData);
            if (item == null)
            {
                Debug.LogWarning($"[Inventory] Item {itemData.itemName} not found");
                return false;
            }

            if (item.quantity < quantity)
            {
                Debug.LogWarning($"[Inventory] Not enough {itemData.itemName} (has {item.quantity}, needs {quantity})");
                return false;
            }

            item.quantity -= quantity;
            if (item.quantity <= 0)
            {
                items.Remove(item);
            }

            OnInventoryChanged?.Invoke();
            Debug.Log($"[Inventory] Removed {quantity}x {itemData.itemName}");
            return true;
        }

        public bool HasItem(ItemData itemData, int quantity = 1)
        {
            InventoryItem item = items.FirstOrDefault(i => i.data == itemData);
            return item != null && item.quantity >= quantity;
        }

        public int GetItemCount(ItemData itemData)
        {
            InventoryItem item = items.FirstOrDefault(i => i.data == itemData);
            return item?.quantity ?? 0;
        }

        public List<InventoryItem> GetAllItems()
        {
            return new List<InventoryItem>(items);
        }

        public void ClearInventory()
        {
            items.Clear();
            OnInventoryChanged?.Invoke();
            Debug.Log("[Inventory] Inventory cleared");
        }

        public bool UseItem(ItemData itemData)
        {
            if (!HasItem(itemData))
                return false;

            // Apply item effects
            if (itemData.itemType == ItemType.Consumable)
            {
                if (ResourceManager.Instance != null)
                {
                    ResourceManager.Instance.AddFood(itemData.foodValue);
                    ResourceManager.Instance.AddWater(itemData.waterValue);
                    ResourceManager.Instance.AddEnergy(itemData.energyValue);
                }

                RemoveItem(itemData, 1);
                Debug.Log($"[Inventory] Used {itemData.itemName}");
                return true;
            }

            return false;
        }
    }

    [System.Serializable]
    public class InventoryItem
    {
        public ItemData data;
        public int quantity = 1;
    }
}
