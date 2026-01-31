using UnityEngine;
using UnityEngine.InputSystem;
using System.Collections.Generic;
using Backpacking.Data;

namespace Backpacking.Gameplay
{
    /// <summary>
    /// Manages the globe visualization including location nodes and travel paths
    /// </summary>
    public class GlobeManager : MonoBehaviour
    {
        [Header("Globe Settings")]
        [SerializeField] private Transform globeTransform;
        [SerializeField] private float globeRadius = 5f;
        [SerializeField] private float rotationSpeed = 10f;

        [Header("Location Node Settings")]
        [SerializeField] private GameObject locationNodePrefab;
        [SerializeField] private Transform nodesParent;

        [Header("Trail Settings")]
        [SerializeField] private LineRenderer trailPrefab;
        [SerializeField] private Transform trailsParent;

        private List<LocationNode> spawnedNodes = new List<LocationNode>();
        private List<LineRenderer> travelTrails = new List<LineRenderer>();

        private void Update()
        {
            HandleGlobeRotation();
        }

        /// <summary>
        /// Spawns a location node on the globe at given lat/long coordinates
        /// </summary>
        public LocationNode SpawnLocationNode(LocationData locationData)
        {
            if (locationNodePrefab == null)
            {
                Debug.LogError("[GlobeManager] Location node prefab is not assigned!");
                return null;
            }

            // Convert lat/long to position on sphere
            Vector3 position = LatLongToPosition(locationData.latitude, locationData.longitude);

            // Instantiate the node
            GameObject nodeObj = Instantiate(locationNodePrefab, position, Quaternion.identity, nodesParent);
            nodeObj.name = $"Node_{locationData.locationName}";

            // Setup the LocationNode component
            LocationNode node = nodeObj.GetComponent<LocationNode>();
            if (node != null)
            {
                node.Initialize(locationData);
                spawnedNodes.Add(node);
            }

            // Point the node outward from globe center
            nodeObj.transform.LookAt(globeTransform.position);
            nodeObj.transform.Rotate(0, 180, 0);

            return node;
        }

        /// <summary>
        /// Draws a trail between two location nodes
        /// </summary>
        public void DrawTrailBetweenNodes(LocationNode startNode, LocationNode endNode)
        {
            if (trailPrefab == null)
            {
                Debug.LogError("[GlobeManager] Trail prefab is not assigned!");
                return;
            }

            LineRenderer trail = Instantiate(trailPrefab, trailsParent);
            trail.positionCount = 2;
            trail.SetPosition(0, startNode.transform.position);
            trail.SetPosition(1, endNode.transform.position);

            travelTrails.Add(trail);
        }

        /// <summary>
        /// Converts latitude and longitude to a 3D position on the globe
        /// </summary>
        private Vector3 LatLongToPosition(float latitude, float longitude)
        {
            // Convert degrees to radians
            float lat = latitude * Mathf.Deg2Rad;
            float lon = longitude * Mathf.Deg2Rad;

            // Convert to Cartesian coordinates
            float x = globeRadius * Mathf.Cos(lat) * Mathf.Cos(lon);
            float y = globeRadius * Mathf.Sin(lat);
            float z = globeRadius * Mathf.Cos(lat) * Mathf.Sin(lon);

            // Return position relative to globe
            return globeTransform.position + new Vector3(x, y, z);
        }

        /// <summary>
        /// Handles rotating the globe with mouse input
        /// </summary>
        private void HandleGlobeRotation()
        {
            // Rotate with right mouse button drag
            if (Mouse.current != null && Mouse.current.rightButton.isPressed)
            {
                Vector2 mouseDelta = Mouse.current.delta.ReadValue();
                float rotX = mouseDelta.x * rotationSpeed * 0.1f;
                float rotY = mouseDelta.y * rotationSpeed * 0.1f;

                globeTransform.Rotate(Vector3.up, -rotX, Space.World);
                globeTransform.Rotate(Vector3.right, rotY, Space.World);
            }
        }

        /// <summary>
        /// Clears all spawned nodes and trails
        /// </summary>
        public void ClearAll()
        {
            foreach (var node in spawnedNodes)
            {
                if (node != null)
                    Destroy(node.gameObject);
            }
            spawnedNodes.Clear();

            foreach (var trail in travelTrails)
            {
                if (trail != null)
                    Destroy(trail.gameObject);
            }
            travelTrails.Clear();
        }
    }
}
