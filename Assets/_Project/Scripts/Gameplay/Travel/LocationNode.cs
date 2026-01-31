using UnityEngine;
using Backpacking.Data;

namespace Backpacking.Gameplay
{
    /// <summary>
    /// Represents a location node on the globe
    /// </summary>
    public class LocationNode : MonoBehaviour
    {
        [Header("Location Data")]
        [SerializeField] private LocationData locationData;
        
        [Header("Visual Settings")]
        [SerializeField] private Color normalColor = Color.white;
        [SerializeField] private Color hoverColor = Color.yellow;
        [SerializeField] private Color visitedColor = Color.gray;
        [SerializeField] private Color currentColor = Color.green;
        
        private Renderer nodeRenderer;
        private bool isVisited = false;
        private bool isCurrent = false;
        private bool isHovered = false;

        public LocationData Data => locationData;
        public bool IsVisited => isVisited;
        public bool IsCurrent => isCurrent;

        private void Awake()
        {
            nodeRenderer = GetComponent<Renderer>();
            UpdateVisual();
        }

        public void Initialize(LocationData data)
        {
            locationData = data;
            
            // Convert lat/long to position on sphere
            float lat = data.latitude * Mathf.Deg2Rad;
            float lon = data.longitude * Mathf.Deg2Rad;
            float radius = 5f; // Match globe radius
            
            Vector3 position = new Vector3(
                radius * Mathf.Cos(lat) * Mathf.Cos(lon),
                radius * Mathf.Sin(lat),
                radius * Mathf.Cos(lat) * Mathf.Sin(lon)
            );
            
            transform.position = position;
        }

        public void SetVisited(bool visited)
        {
            isVisited = visited;
            UpdateVisual();
        }

        public void SetCurrent(bool current)
        {
            isCurrent = current;
            UpdateVisual();
        }

        private void OnMouseEnter()
        {
            isHovered = true;
            UpdateVisual();
            
            // TODO: Show location info tooltip
            Debug.Log($"Hovering: {locationData.locationName}");
        }

        private void OnMouseExit()
        {
            isHovered = false;
            UpdateVisual();
        }

        private void OnMouseDown()
        {
            // TODO: Trigger location selection
            Debug.Log($"Clicked: {locationData.locationName}");
        }

        private void UpdateVisual()
        {
            if (nodeRenderer == null) return;

            Color targetColor = normalColor;
            
            if (isCurrent)
                targetColor = currentColor;
            else if (isHovered)
                targetColor = hoverColor;
            else if (isVisited)
                targetColor = visitedColor;

            nodeRenderer.material.color = targetColor;
        }
    }
}
