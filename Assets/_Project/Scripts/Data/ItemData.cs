using UnityEngine;

namespace Backpacking.Data
{
    /// <summary>
    /// ScriptableObject that defines an item (food, water, equipment)
    /// </summary>
    [CreateAssetMenu(fileName = "New Item", menuName = "Backpacking/Item Data")]
    public class ItemData : ScriptableObject
    {
        [Header("Basic Info")]
        public string itemName = "New Item";
        [TextArea(2, 4)]
        public string description = "Item description";
        public Sprite icon;
        
        [Header("Properties")]
        public ItemType itemType = ItemType.Consumable;
        public float weight = 1f; // in kg
        public int maxStackSize = 1;
        
        [Header("Consumable Effects (if applicable)")]
        public float foodValue = 0f;
        public float waterValue = 0f;
        public float energyValue = 0f;
        
        [Header("Equipment Effects (if applicable)")]
        public bool isEquipment = false;
        public float durability = 100f;
        public EquipmentSlot equipmentSlot = EquipmentSlot.None;
        
        // Modifier effects when equipped
        public float weightReductionPercent = 0f; // Reduces carried weight
        public float waterConsumptionReduction = 0f;
        public float energyConsumptionReduction = 0f;
    }

    public enum ItemType
    {
        Consumable,
        Equipment,
        QuestItem
    }

    public enum EquipmentSlot
    {
        None,
        Backpack,
        SleepingGear,
        WaterFilter,
        Shoes,
        Clothing
    }
}
