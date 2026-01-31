using UnityEngine;
using UnityEditor;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;

namespace Backpacking.Editor
{
    public class FixEventSystem
    {
        [MenuItem("Backpacking/Fix EventSystem for Input System")]
        public static void FixExistingEventSystem()
        {
            EventSystem eventSystem = GameObject.FindFirstObjectByType<EventSystem>();

            if (eventSystem == null)
            {
                Debug.LogWarning("[FixEventSystem] No EventSystem found in scene. Creating new one...");
                GameObject eventSystemObj = new GameObject("EventSystem");
                eventSystem = eventSystemObj.AddComponent<EventSystem>();
                eventSystemObj.AddComponent<InputSystemUIInputModule>();
                Debug.Log("✅ Created new EventSystem with InputSystemUIInputModule");
                return;
            }

            // Remove old StandaloneInputModule if it exists
            StandaloneInputModule oldModule = eventSystem.GetComponent<StandaloneInputModule>();
            if (oldModule != null)
            {
                Object.DestroyImmediate(oldModule);
                Debug.Log("[FixEventSystem] Removed old StandaloneInputModule");
            }

            // Add InputSystemUIInputModule if it doesn't exist
            InputSystemUIInputModule newModule = eventSystem.GetComponent<InputSystemUIInputModule>();
            if (newModule == null)
            {
                eventSystem.gameObject.AddComponent<InputSystemUIInputModule>();
                Debug.Log("✅ Added InputSystemUIInputModule to EventSystem");
            }
            else
            {
                Debug.Log("✅ EventSystem already has InputSystemUIInputModule");
            }

            EditorUtility.SetDirty(eventSystem.gameObject);
        }
    }
}
