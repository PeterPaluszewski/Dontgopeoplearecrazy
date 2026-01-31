using NUnit.Framework;
using UnityEngine;
using Backpacking.Gameplay;

namespace Backpacking.Tests.PlayMode
{
    /// <summary>
    /// Play Mode tests for ResourceManager
    /// </summary>
    public class ResourceManagerTests
    {
        private GameObject testObject;
        private ResourceManager resources;

        [SetUp]
        public void Setup()
        {
            testObject = new GameObject("TestResources");
            resources = testObject.AddComponent<ResourceManager>();
        }

        [TearDown]
        public void Teardown()
        {
            Object.Destroy(testObject);
        }

        [Test]
        public void AddFood_IncreasesFood()
        {
            // Arrange
            float initial = resources.CurrentFood;

            // Act
            resources.AddFood(20f);

            // Assert
            Assert.AreEqual(initial + 20f, resources.CurrentFood, "Food should increase by 20");
        }

        [Test]
        public void AddFood_CannotExceedMax()
        {
            // Act
            resources.AddFood(150f); // Try to add more than max (100)

            // Assert
            Assert.AreEqual(resources.MaxFood, resources.CurrentFood, "Food should not exceed max");
        }

        [Test]
        public void ConsumeFood_DecreasesFood()
        {
            // Arrange
            resources.SetFood(50f);

            // Act
            bool result = resources.ConsumeFood(20f);

            // Assert
            Assert.IsTrue(result, "Should successfully consume food");
            Assert.AreEqual(30f, resources.CurrentFood, "Food should decrease by 20");
        }

        [Test]
        public void ConsumeFood_InsufficientAmount_Fails()
        {
            // Arrange
            resources.SetFood(10f);

            // Act
            bool result = resources.ConsumeFood(20f);

            // Assert
            Assert.IsFalse(result, "Should fail when insufficient food");
            Assert.AreEqual(10f, resources.CurrentFood, "Food should not change");
        }

        [Test]
        public void HasEnoughFood_ReturnsCorrectValue()
        {
            // Arrange
            resources.SetFood(30f);

            // Assert
            Assert.IsTrue(resources.HasEnoughFood(20f), "Should have enough food");
            Assert.IsFalse(resources.HasEnoughFood(40f), "Should not have enough food");
        }

        [Test]
        public void AddWater_IncreasesWater()
        {
            // Arrange
            float initial = resources.CurrentWater;

            // Act
            resources.AddWater(30f);

            // Assert
            Assert.AreEqual(initial + 30f, resources.CurrentWater, "Water should increase by 30");
        }

        [Test]
        public void AddEnergy_IncreasesEnergy()
        {
            // Arrange
            resources.SetEnergy(50f);

            // Act
            resources.AddEnergy(25f);

            // Assert
            Assert.AreEqual(75f, resources.CurrentEnergy, "Energy should increase to 75");
        }

        [Test]
        public void RestoreAllResources_SetsToMax()
        {
            // Arrange
            resources.SetFood(10f);
            resources.SetWater(20f);
            resources.SetEnergy(30f);

            // Act
            resources.RestoreAllResources();

            // Assert
            Assert.AreEqual(resources.MaxFood, resources.CurrentFood, "Food should be at max");
            Assert.AreEqual(resources.MaxWater, resources.CurrentWater, "Water should be at max");
            Assert.AreEqual(resources.MaxEnergy, resources.CurrentEnergy, "Energy should be at max");
        }
    }
}
