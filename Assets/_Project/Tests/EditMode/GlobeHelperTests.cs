using NUnit.Framework;
using UnityEngine;
using Backpacking.Utilities;

namespace Backpacking.Tests.EditMode
{
    /// <summary>
    /// Edit Mode tests for GlobeHelper utility functions
    /// These tests run without Unity runtime, faster for pure logic testing
    /// </summary>
    public class GlobeHelperTests
    {
        [Test]
        public void LatLongToPosition_Equator_ReturnsCorrectPosition()
        {
            // Arrange
            float lat = 0f;
            float lon = 0f;
            float radius = 5f;

            // Act
            Vector3 position = GlobeHelper.LatLongToPosition(lat, lon, radius);

            // Assert
            Assert.AreEqual(5f, position.x, 0.01f, "X should be at radius");
            Assert.AreEqual(0f, position.y, 0.01f, "Y should be 0 at equator");
            Assert.AreEqual(0f, position.z, 0.01f, "Z should be 0 at prime meridian");
        }

        [Test]
        public void LatLongToPosition_NorthPole_ReturnsCorrectPosition()
        {
            // Arrange
            float lat = 90f;
            float lon = 0f;
            float radius = 5f;

            // Act
            Vector3 position = GlobeHelper.LatLongToPosition(lat, lon, radius);

            // Assert
            Assert.AreEqual(0f, position.x, 0.01f, "X should be 0 at pole");
            Assert.AreEqual(5f, position.y, 0.01f, "Y should be at radius (north pole)");
            Assert.AreEqual(0f, position.z, 0.01f, "Z should be 0 at pole");
        }

        [Test]
        public void LatLongToPosition_SouthPole_ReturnsCorrectPosition()
        {
            // Arrange
            float lat = -90f;
            float lon = 0f;
            float radius = 5f;

            // Act
            Vector3 position = GlobeHelper.LatLongToPosition(lat, lon, radius);

            // Assert
            Assert.AreEqual(0f, position.x, 0.01f, "X should be 0 at pole");
            Assert.AreEqual(-5f, position.y, 0.01f, "Y should be negative (south pole)");
            Assert.AreEqual(0f, position.z, 0.01f, "Z should be 0 at pole");
        }

        [Test]
        public void CalculateDistance_SamePoint_ReturnsZero()
        {
            // Arrange
            float lat1 = 40.7f;
            float lon1 = -74.0f;

            // Act
            float distance = GlobeHelper.CalculateDistance(lat1, lon1, lat1, lon1);

            // Assert
            Assert.AreEqual(0f, distance, 0.01f, "Distance between same point should be 0");
        }

        [Test]
        public void CalculateDistance_NewYorkToLondon_ReturnsApproximateDistance()
        {
            // Arrange - New York to London
            float lat1 = 40.7128f;
            float lon1 = -74.0060f;
            float lat2 = 51.5074f;
            float lon2 = -0.1278f;

            // Act
            float distance = GlobeHelper.CalculateDistance(lat1, lon1, lat2, lon2);

            // Assert
            // Actual distance is ~5570 km, but using simplified calculation
            Assert.Greater(distance, 5000f, "Distance should be over 5000 km");
            Assert.Less(distance, 6000f, "Distance should be under 6000 km");
        }

        [Test]
        public void CalculateDistance_OppositeHemispheres_ReturnsLargeDistance()
        {
            // Arrange - North pole to South pole
            float lat1 = 90f;
            float lon1 = 0f;
            float lat2 = -90f;
            float lon2 = 0f;

            // Act
            float distance = GlobeHelper.CalculateDistance(lat1, lon1, lat2, lon2);

            // Assert
            // Half Earth's circumference ~20,000 km
            Assert.Greater(distance, 19000f, "Distance should be close to half Earth's circumference");
        }
    }
}
