using UnityEngine;
using System;
using System.IO;
using Backpacking.Gameplay;

namespace Backpacking.Core
{
    /// <summary>
    /// Handles saving and loading game data
    /// Uses JSON serialization with PlayerPrefs for simple data
    /// </summary>
    public class SaveManager : MonoBehaviour
    {
        private const string SAVE_FILE_NAME = "savegame.json";
        private const string SAVE_KEY = "BackpackingSaveData";

        [Header("Save Settings")]
        [SerializeField] private bool useFileSystem = true; // If false, uses PlayerPrefs
        [SerializeField] private bool autoSave = true;
        [SerializeField] private float autoSaveInterval = 300f; // 5 minutes

        private string SavePath => Path.Combine(Application.persistentDataPath, SAVE_FILE_NAME);
        private float autoSaveTimer = 0f;

        private void Update()
        {
            if (autoSave && GameManager.Instance != null && GameManager.Instance.IsGameActive)
            {
                autoSaveTimer += Time.deltaTime;
                if (autoSaveTimer >= autoSaveInterval)
                {
                    SaveGame();
                    autoSaveTimer = 0f;
                }
            }
        }

        public void SaveGame()
        {
            try
            {
                SaveData data = CreateSaveData();
                string json = JsonUtility.ToJson(data, true);

                if (useFileSystem)
                {
                    File.WriteAllText(SavePath, json);
                    Debug.Log($"[SaveManager] Game saved to: {SavePath}");
                }
                else
                {
                    PlayerPrefs.SetString(SAVE_KEY, json);
                    PlayerPrefs.Save();
                    Debug.Log("[SaveManager] Game saved to PlayerPrefs");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveManager] Failed to save game: {e.Message}");
            }
        }

        public void LoadGame()
        {
            try
            {
                string json = "";

                if (useFileSystem)
                {
                    if (File.Exists(SavePath))
                    {
                        json = File.ReadAllText(SavePath);
                        Debug.Log($"[SaveManager] Loading game from: {SavePath}");
                    }
                    else
                    {
                        Debug.LogWarning("[SaveManager] Save file not found!");
                        return;
                    }
                }
                else
                {
                    if (PlayerPrefs.HasKey(SAVE_KEY))
                    {
                        json = PlayerPrefs.GetString(SAVE_KEY);
                        Debug.Log("[SaveManager] Loading game from PlayerPrefs");
                    }
                    else
                    {
                        Debug.LogWarning("[SaveManager] No save data in PlayerPrefs!");
                        return;
                    }
                }

                SaveData data = JsonUtility.FromJson<SaveData>(json);
                ApplySaveData(data);
                Debug.Log("[SaveManager] Game loaded successfully");
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveManager] Failed to load game: {e.Message}");
            }
        }

        public bool HasSaveData()
        {
            if (useFileSystem)
            {
                return File.Exists(SavePath);
            }
            else
            {
                return PlayerPrefs.HasKey(SAVE_KEY);
            }
        }

        public void DeleteSaveData()
        {
            try
            {
                if (useFileSystem && File.Exists(SavePath))
                {
                    File.Delete(SavePath);
                    Debug.Log("[SaveManager] Save file deleted");
                }
                else if (!useFileSystem && PlayerPrefs.HasKey(SAVE_KEY))
                {
                    PlayerPrefs.DeleteKey(SAVE_KEY);
                    PlayerPrefs.Save();
                    Debug.Log("[SaveManager] PlayerPrefs save deleted");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveManager] Failed to delete save: {e.Message}");
            }
        }

        private SaveData CreateSaveData()
        {
            SaveData data = new SaveData
            {
                saveVersion = 1,
                saveTimestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),

                // Player resources
                currentFood = ResourceManager.Instance?.CurrentFood ?? 0,
                currentWater = ResourceManager.Instance?.CurrentWater ?? 0,
                currentEnergy = ResourceManager.Instance?.CurrentEnergy ?? 0,

                // TODO: Add inventory data
                // TODO: Add current location
                // TODO: Add game progress
            };

            return data;
        }

        private void ApplySaveData(SaveData data)
        {
            Debug.Log($"[SaveManager] Applying save data (Version: {data.saveVersion}, Saved: {data.saveTimestamp})");

            // Restore resources
            if (ResourceManager.Instance != null)
            {
                ResourceManager.Instance.SetFood(data.currentFood);
                ResourceManager.Instance.SetWater(data.currentWater);
                ResourceManager.Instance.SetEnergy(data.currentEnergy);
            }

            // TODO: Restore inventory
            // TODO: Restore location
            // TODO: Restore game progress
        }
    }

    /// <summary>
    /// Data structure for save files
    /// </summary>
    [Serializable]
    public class SaveData
    {
        public int saveVersion;
        public string saveTimestamp;

        // Resources
        public float currentFood;
        public float currentWater;
        public float currentEnergy;

        // TODO: Add inventory array
        // TODO: Add current location ID
        // TODO: Add visited locations
        // TODO: Add game day/time
    }
}
