using UnityEngine;

namespace Backpacking.Data
{
    /// <summary>
    /// ScriptableObject that defines a location on the map
    /// </summary>
    [CreateAssetMenu(fileName = "New Location", menuName = "Backpacking/Location Data")]
    public class LocationData : ScriptableObject
    {
        [Header("Basic Info")]
        public string locationName = "New Location";
        [TextArea(3, 6)]
        public string description = "Location description";
        public Sprite locationIcon;
        
        [Header("Map Position")]
        [Tooltip("Latitude in degrees (-90 to 90)")]
        [Range(-90f, 90f)]
        public float latitude = 0f;
        
        [Tooltip("Longitude in degrees (-180 to 180)")]
        [Range(-180f, 180f)]
        public float longitude = 0f;
        
        [Header("Location Properties")]
        public LocationType locationType = LocationType.Waypoint;
        public bool isStartingLocation = false;
        public bool isFinalDestination = false;
        
        [Header("Services Available")]
        public bool canRest = true;
        public bool canBuySupplies = false;
        public bool hasShelter = false;
        
        [Header("Travel Requirements")]
        [Tooltip("Days required to reach from previous location")]
        public float travelDays = 1f;
        
        [Tooltip("Base difficulty (affects resource consumption)")]
        [Range(0.5f, 3f)]
        public float difficultyMultiplier = 1f;
        
        [Header("Connected Locations")]
        [Tooltip("Locations that can be reached from here")]
        public LocationData[] connectedLocations;
    }

    public enum LocationType
    {
        Waypoint,
        Town,
        Camp,
        Landmark,
        Destination
    }
}
