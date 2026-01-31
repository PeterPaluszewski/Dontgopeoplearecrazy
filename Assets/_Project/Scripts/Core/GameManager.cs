using UnityEngine;
using Backpacking.Gameplay;

namespace Backpacking.Core
{
    /// <summary>
    /// Main game manager - singleton that persists across scenes
    /// Manages core game state and coordinates between systems
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private bool isGameActive = false;

        [Header("System References")]
        [SerializeField] private SaveManager saveManager;
        [SerializeField] private InventoryManager inventoryManager;
        [SerializeField] private ResourceManager resourceManager;

        public bool IsGameActive => isGameActive;

        private void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeSystems();
        }

        private void InitializeSystems()
        {
            Debug.Log("[GameManager] Initializing game systems...");

            // Initialize core systems
            if (saveManager == null)
                saveManager = GetComponent<SaveManager>();

            if (inventoryManager == null)
                inventoryManager = FindFirstObjectByType<InventoryManager>();

            if (resourceManager == null)
                resourceManager = FindFirstObjectByType<ResourceManager>();

        }

        public void StartNewGame()
        {
            Debug.Log("[GameManager] Starting new game...");
            isGameActive = true;

            // Initialize player resources
            resourceManager?.InitializeResources();

            // Clear inventory
            inventoryManager?.ClearInventory();

            // TODO: Load starting location
            // TODO: Give player starting items
        }

        public void LoadGame()
        {
            Debug.Log("[GameManager] Loading saved game...");

            if (saveManager != null && saveManager.HasSaveData())
            {
                saveManager.LoadGame();
                isGameActive = true;
            }
            else
            {
                Debug.LogWarning("[GameManager] No save data found!");
            }
        }

        public void SaveGame()
        {
            Debug.Log("[GameManager] Saving game...");
            saveManager?.SaveGame();
        }

        public void QuitGame()
        {
            Debug.Log("[GameManager] Quitting game...");
            SaveGame();

#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        public void PauseGame()
        {
            Time.timeScale = 0f;
        }

        public void ResumeGame()
        {
            Time.timeScale = 1f;
        }

        private void OnApplicationQuit()
        {
            // Auto-save on quit
            if (isGameActive)
            {
                SaveGame();
            }
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            // Auto-save on mobile when app goes to background
            if (pauseStatus && isGameActive)
            {
                SaveGame();
            }
        }
    }
}
