using UnityEngine;

namespace Backpacking.Data
{
    /// <summary>
    /// ScriptableObject that defines a random event with choices
    /// </summary>
    [CreateAssetMenu(fileName = "New Event", menuName = "Backpacking/Event Data")]
    public class EventData : ScriptableObject
    {
        [Header("Event Info")]
        public string eventName = "New Event";
        
        [TextArea(4, 8)]
        public string eventDescription = "What happens in this event?";
        
        public Sprite eventImage;
        
        [Header("Event Type")]
        public EventType eventType = EventType.Random;
        public EventCategory category = EventCategory.Encounter;
        
        [Header("Trigger Conditions")]
        [Tooltip("Minimum day for this event to trigger")]
        public int minDay = 0;
        
        [Tooltip("Can this event repeat?")]
        public bool canRepeat = true;
        
        [Tooltip("Chance of triggering (0-1)")]
        [Range(0f, 1f)]
        public float triggerChance = 0.3f;
        
        [Header("Choices")]
        public EventChoice[] choices;
    }

    [System.Serializable]
    public class EventChoice
    {
        [TextArea(2, 3)]
        public string choiceText = "What do you do?";
        
        [Header("Resource Costs/Gains")]
        public float foodChange = 0f;
        public float waterChange = 0f;
        public float energyChange = 0f;
        
        [Header("Other Effects")]
        [TextArea(2, 4)]
        public string resultDescription = "Result of this choice";
        
        [Tooltip("Items gained (if any)")]
        public ItemData[] itemsGained;
        
        [Tooltip("Items lost (if any)")]
        public ItemData[] itemsLost;
        
        [Tooltip("Does this choice end the game?")]
        public bool causesGameOver = false;
        
        [Tooltip("Game over message if applicable")]
        public string gameOverMessage = "";
    }

    public enum EventType
    {
        Random,      // Can happen anytime
        LocationSpecific, // Only at certain locations
        Scripted     // Triggered by story/progress
    }

    public enum EventCategory
    {
        Encounter,   // Meet someone/something
        Weather,     // Weather-related
        Accident,    // Mishap or injury
        Discovery,   // Find something
        Challenge    // Obstacle to overcome
    }
}
