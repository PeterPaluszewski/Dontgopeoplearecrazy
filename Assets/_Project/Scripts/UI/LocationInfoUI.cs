using UnityEngine;
using TMPro;
using UnityEngine.UI;
using Backpacking.Data;
using Backpacking.Gameplay;

namespace Backpacking.UI
{
    /// <summary>
    /// Displays information about the currently selected location
    /// </summary>
    public class LocationInfoUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshProUGUI locationNameText;
        [SerializeField] private TextMeshProUGUI descriptionText;
        [SerializeField] private TextMeshProUGUI coordinatesText;
        [SerializeField] private Button travelButton;
        [SerializeField] private Button closeButton;

        [Header("Settings")]
        [SerializeField] private bool hideOnStart = true;

        private LocationNode currentLocationNode;

        private void Start()
        {
            if (travelButton != null)
            {
                travelButton.onClick.AddListener(OnTravelButtonClicked);
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            if (hideOnStart)
            {
                gameObject.SetActive(false);
            }
        }

        public void ShowLocationInfo(LocationNode locationNode)
        {
            if (locationNode == null || locationNode.Data == null)
            {
                Hide();
                return;
            }

            currentLocationNode = locationNode;
            LocationData data = locationNode.Data;            // Update UI elements
            if (locationNameText != null)
            {
                locationNameText.text = data.locationName;
            }

            if (descriptionText != null)
            {
                descriptionText.text = data.description;
            }

            if (coordinatesText != null)
            {
                coordinatesText.text = $"Lat: {data.latitude:F2}°, Long: {data.longitude:F2}°";
            }

            // Show/hide travel button based on whether location is visited
            if (travelButton != null)
            {
                travelButton.gameObject.SetActive(!locationNode.IsVisited);
            }

            gameObject.SetActive(true);
        }

        public void Hide()
        {
            gameObject.SetActive(false);
            currentLocationNode = null;
        }

        private void OnTravelButtonClicked()
        {
            if (currentLocationNode != null)
            {
                // TODO: Implement travel logic
                Debug.Log($"[LocationInfoUI] Travel to {currentLocationNode.Data.locationName}");
                Hide();
            }
        }
    }
}
