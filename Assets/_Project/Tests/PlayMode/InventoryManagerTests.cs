using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using System.Collections;
using Backpacking.Data;
using Backpacking.Gameplay;

namespace Backpacking.Tests.PlayMode
{
    /// <summary>
    /// Play Mode tests for InventoryManager
    /// These tests run in the Unity runtime with full GameObject support
    /// </summary>
    public class InventoryManagerTests
    {
        private GameObject testObject;
        private InventoryManager inventory;
        private ItemData testItem;

        [SetUp]
        public void Setup()
        {
            // Create test GameObject with InventoryManager
            testObject = new GameObject("TestInventory");
            inventory = testObject.AddComponent<InventoryManager>();

            // Create test item
            testItem = ScriptableObject.CreateInstance<ItemData>();
            testItem.itemName = "Test Item";
            testItem.weight = 1f;
            testItem.maxStackSize = 5;
            testItem.itemType = ItemType.Equipment;
        }

        [TearDown]
        public void Teardown()
        {
            // Clean up
            Object.Destroy(testObject);
            Object.Destroy(testItem);
        }

        [Test]
        public void AddItem_SingleItem_Success()
        {
            // Act
            bool result = inventory.AddItem(testItem, 1);

            // Assert
            Assert.IsTrue(result, "Should successfully add item");
            Assert.AreEqual(1, inventory.GetItemCount(testItem), "Should have 1 item");
            Assert.AreEqual(1f, inventory.CurrentWeight, "Weight should be 1kg");
        }

        [Test]
        public void AddItem_MultipleItems_StacksCorrectly()
        {
            // Act
            inventory.AddItem(testItem, 3);

            // Assert
            Assert.AreEqual(3, inventory.GetItemCount(testItem), "Should have 3 items");
            Assert.AreEqual(3f, inventory.CurrentWeight, "Weight should be 3kg");
        }

        [Test]
        public void AddItem_ExceedsMaxStack_CreatesMultipleStacks()
        {
            // Act
            inventory.AddItem(testItem, 10); // Max stack is 5

            // Assert
            Assert.AreEqual(10, inventory.GetItemCount(testItem), "Should have 10 items total");
        }

        [Test]
        public void AddItem_ExceedsWeight_Fails()
        {
            // Arrange
            ItemData heavyItem = ScriptableObject.CreateInstance<ItemData>();
            heavyItem.weight = 25f; // Exceeds default max weight of 20kg
            heavyItem.maxStackSize = 1;

            // Act
            bool result = inventory.AddItem(heavyItem, 1);

            // Assert
            Assert.IsFalse(result, "Should fail to add item that exceeds weight limit");
            Assert.AreEqual(0, inventory.GetItemCount(heavyItem), "Should not have item");

            // Cleanup
            Object.Destroy(heavyItem);
        }

        [Test]
        public void RemoveItem_ExistingItem_Success()
        {
            // Arrange
            inventory.AddItem(testItem, 3);

            // Act
            bool result = inventory.RemoveItem(testItem, 2);

            // Assert
            Assert.IsTrue(result, "Should successfully remove items");
            Assert.AreEqual(1, inventory.GetItemCount(testItem), "Should have 1 item remaining");
            Assert.AreEqual(1f, inventory.CurrentWeight, "Weight should be 1kg");
        }

        [Test]
        public void RemoveItem_AllItems_EmptiesInventory()
        {
            // Arrange
            inventory.AddItem(testItem, 3);

            // Act
            inventory.RemoveItem(testItem, 3);

            // Assert
            Assert.AreEqual(0, inventory.GetItemCount(testItem), "Should have no items");
            Assert.AreEqual(0f, inventory.CurrentWeight, "Weight should be 0kg");
        }

        [Test]
        public void RemoveItem_MoreThanExists_Fails()
        {
            // Arrange
            inventory.AddItem(testItem, 2);

            // Act
            bool result = inventory.RemoveItem(testItem, 5);

            // Assert
            Assert.IsFalse(result, "Should fail to remove more items than exist");
            Assert.AreEqual(2, inventory.GetItemCount(testItem), "Should still have 2 items");
        }

        [Test]
        public void HasItem_ItemExists_ReturnsTrue()
        {
            // Arrange
            inventory.AddItem(testItem, 3);

            // Act & Assert
            Assert.IsTrue(inventory.HasItem(testItem, 3), "Should have 3 items");
            Assert.IsTrue(inventory.HasItem(testItem, 2), "Should have at least 2 items");
            Assert.IsFalse(inventory.HasItem(testItem, 5), "Should not have 5 items");
        }

        [Test]
        public void ClearInventory_RemovesAllItems()
        {
            // Arrange
            inventory.AddItem(testItem, 3);

            // Act
            inventory.ClearInventory();

            // Assert
            Assert.AreEqual(0, inventory.GetItemCount(testItem), "Should have no items");
            Assert.AreEqual(0f, inventory.CurrentWeight, "Weight should be 0kg");
        }

        [UnityTest]
        public IEnumerator UseItem_Consumable_RestoresResources()
        {
            // Arrange
            GameObject resourceObj = new GameObject("Resources");
            ResourceManager resources = resourceObj.AddComponent<ResourceManager>();
            
            ItemData consumable = ScriptableObject.CreateInstance<ItemData>();
            consumable.itemType = ItemType.Consumable;
            consumable.foodValue = 20f;
            consumable.waterValue = 10f;
            consumable.weight = 0.5f;
            consumable.maxStackSize = 10;
            
            inventory.AddItem(consumable, 1);
            resources.SetFood(50f); // Start at 50
            
            yield return null; // Wait one frame for ResourceManager.Instance to initialize

            // Act
            bool result = inventory.UseItem(consumable);

            // Assert
            Assert.IsTrue(result, "Should successfully use consumable");
            Assert.AreEqual(0, inventory.GetItemCount(consumable), "Consumable should be removed");
            Assert.AreEqual(70f, resources.CurrentFood, "Food should increase by 20");
            Assert.AreEqual(10f, resources.CurrentWater, "Water should increase by 10");

            // Cleanup
            Object.Destroy(resourceObj);
            Object.Destroy(consumable);
        }
    }
}
