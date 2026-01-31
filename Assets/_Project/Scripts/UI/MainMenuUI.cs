using UnityEngine;
using UnityEngine.UI;
using Backpacking.Core;

namespace Backpacking.UI
{
    /// <summary>
    /// Main menu UI with New Game, Continue, and Quit buttons
    /// </summary>
    public class MainMenuUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Button newGameButton;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button quitButton;
        [SerializeField] private GameObject gameplayUI; // Reference to the main gameplay UI

        private GameManager gameManager;
        private SaveManager saveManager;

        private void Start()
        {
            gameManager = FindFirstObjectByType<GameManager>();
            saveManager = FindFirstObjectByType<SaveManager>();

            if (gameManager == null)
            {
                Debug.LogError("[MainMenuUI] GameManager not found!");
            }

            if (saveManager == null)
            {
                Debug.LogError("[MainMenuUI] SaveManager not found!");
            }

            // Set up button listeners
            if (newGameButton != null)
            {
                newGameButton.onClick.AddListener(OnNewGameClicked);
            }

            if (continueButton != null)
            {
                continueButton.onClick.AddListener(OnContinueClicked);
                // Disable continue button if no save exists
                continueButton.interactable = saveManager != null && saveManager.HasSaveData();
            }

            if (quitButton != null)
            {
                quitButton.onClick.AddListener(OnQuitClicked);
            }
        }

        private void OnNewGameClicked()
        {
            if (gameManager != null)
            {
                gameManager.StartNewGame();
                HideMenu();
            }
        }

        private void OnContinueClicked()
        {
            if (gameManager != null)
            {
                gameManager.LoadGame();
                HideMenu();
            }
        }

        private void OnQuitClicked()
        {
            if (gameManager != null)
            {
                gameManager.QuitGame();
            }
            else
            {
#if UNITY_EDITOR
                UnityEditor.EditorApplication.isPlaying = false;
#else
                Application.Quit();
#endif
            }
        }

        private void HideMenu()
        {
            gameObject.SetActive(false);

            if (gameplayUI != null)
            {
                gameplayUI.SetActive(true);
            }
        }

        public void ShowMenu()
        {
            gameObject.SetActive(true);

            if (gameplayUI != null)
            {
                gameplayUI.SetActive(false);
            }

            // Update continue button state
            if (continueButton != null && saveManager != null)
            {
                continueButton.interactable = saveManager.HasSaveData();
            }
        }
    }
}
