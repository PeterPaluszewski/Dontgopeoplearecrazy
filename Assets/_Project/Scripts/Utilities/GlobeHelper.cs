using UnityEngine;

namespace Backpacking.Utilities
{
    /// <summary>
    /// Helper class for globe-related calculations
    /// </summary>
    public static class GlobeHelper
    {
        /// <summary>
        /// Converts latitude/longitude to 3D position on a sphere
        /// </summary>
        public static Vector3 LatLongToPosition(float latitude, float longitude, float radius)
        {
            float lat = latitude * Mathf.Deg2Rad;
            float lon = longitude * Mathf.Deg2Rad;
            
            return new Vector3(
                radius * Mathf.Cos(lat) * Mathf.Cos(lon),
                radius * Mathf.Sin(lat),
                radius * Mathf.Cos(lat) * Mathf.Sin(lon)
            );
        }

        /// <summary>
        /// Converts 3D position to latitude/longitude
        /// </summary>
        public static Vector2 PositionToLatLong(Vector3 position)
        {
            float radius = position.magnitude;
            float latitude = Mathf.Asin(position.y / radius) * Mathf.Rad2Deg;
            float longitude = Mathf.Atan2(position.z, position.x) * Mathf.Rad2Deg;
            
            return new Vector2(latitude, longitude);
        }

        /// <summary>
        /// Creates points along a great circle arc between two positions on a sphere
        /// </summary>
        public static Vector3[] CreateArc(Vector3 start, Vector3 end, float radius, int segments = 20)
        {
            Vector3[] points = new Vector3[segments];
            
            for (int i = 0; i < segments; i++)
            {
                float t = i / (float)(segments - 1);
                Vector3 point = Vector3.Slerp(start.normalized, end.normalized, t) * radius;
                points[i] = point;
            }
            
            return points;
        }

        /// <summary>
        /// Calculates the great circle distance between two lat/long coordinates (in km)
        /// </summary>
        public static float CalculateDistance(float lat1, float lon1, float lat2, float lon2)
        {
            const float EARTH_RADIUS = 6371f; // km
            
            float dLat = (lat2 - lat1) * Mathf.Deg2Rad;
            float dLon = (lon2 - lon1) * Mathf.Deg2Rad;
            
            float a = Mathf.Sin(dLat / 2) * Mathf.Sin(dLat / 2) +
                     Mathf.Cos(lat1 * Mathf.Deg2Rad) * Mathf.Cos(lat2 * Mathf.Deg2Rad) *
                     Mathf.Sin(dLon / 2) * Mathf.Sin(dLon / 2);
            
            float c = 2 * Mathf.Atan2(Mathf.Sqrt(a), Mathf.Sqrt(1 - a));
            
            return EARTH_RADIUS * c;
        }
    }
}
