using UnityEngine;
using System;

namespace Backpacking.Gameplay
{
    /// <summary>
    /// Manages player resources: Food, Water, and Energy
    /// </summary>
    public class ResourceManager : MonoBehaviour
    {
        public static ResourceManager Instance { get; private set; }

        [Header("Starting Resources")]
        [SerializeField] private float startingFood = 100f;
        [SerializeField] private float startingWater = 100f;
        [SerializeField] private float startingEnergy = 100f;

        [Header("Maximum Resources")]
        [SerializeField] private float maxFood = 100f;
        [SerializeField] private float maxWater = 100f;
        [SerializeField] private float maxEnergy = 100f;

        [Header("Current Resources")]
        [SerializeField] private float currentFood;
        [SerializeField] private float currentWater;
        [SerializeField] private float currentEnergy;

        // Events for UI updates
        public event Action<float, float> OnFoodChanged;
        public event Action<float, float> OnWaterChanged;
        public event Action<float, float> OnEnergyChanged;
        public event Action<ResourceType> OnResourceDepleted;

        public float CurrentFood => currentFood;
        public float CurrentWater => currentWater;
        public float CurrentEnergy => currentEnergy;
        public float MaxFood => maxFood;
        public float MaxWater => maxWater;
        public float MaxEnergy => maxEnergy;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public void InitializeResources()
        {
            currentFood = startingFood;
            currentWater = startingWater;
            currentEnergy = startingEnergy;

            NotifyResourceChanges();
        }

        public void AddFood(float amount)
        {
            currentFood = Mathf.Clamp(currentFood + amount, 0, maxFood);
            OnFoodChanged?.Invoke(currentFood, maxFood);
        }

        public void AddWater(float amount)
        {
            currentWater = Mathf.Clamp(currentWater + amount, 0, maxWater);
            OnWaterChanged?.Invoke(currentWater, maxWater);
        }

        public void AddEnergy(float amount)
        {
            currentEnergy = Mathf.Clamp(currentEnergy + amount, 0, maxEnergy);
            OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
        }

        public void ConsumeFood(float amount)
        {
            currentFood = Mathf.Max(0, currentFood - amount);
            OnFoodChanged?.Invoke(currentFood, maxFood);
            
            if (currentFood <= 0)
            {
                OnResourceDepleted?.Invoke(ResourceType.Food);
            }
        }

        public void ConsumeWater(float amount)
        {
            currentWater = Mathf.Max(0, currentWater - amount);
            OnWaterChanged?.Invoke(currentWater, maxWater);
            
            if (currentWater <= 0)
            {
                OnResourceDepleted?.Invoke(ResourceType.Water);
            }
        }

        public void ConsumeEnergy(float amount)
        {
            currentEnergy = Mathf.Max(0, currentEnergy - amount);
            OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
            
            if (currentEnergy <= 0)
            {
                OnResourceDepleted?.Invoke(ResourceType.Energy);
            }
        }

        public void SetFood(float amount)
        {
            currentFood = Mathf.Clamp(amount, 0, maxFood);
            OnFoodChanged?.Invoke(currentFood, maxFood);
        }

        public void SetWater(float amount)
        {
            currentWater = Mathf.Clamp(amount, 0, maxWater);
            OnWaterChanged?.Invoke(currentWater, maxWater);
        }

        public void SetEnergy(float amount)
        {
            currentEnergy = Mathf.Clamp(amount, 0, maxEnergy);
            OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
        }

        public bool HasEnoughResources(float food, float water, float energy)
        {
            return currentFood >= food && currentWater >= water && currentEnergy >= energy;
        }

        public bool IsAnyResourceDepleted()
        {
            return currentFood <= 0 || currentWater <= 0 || currentEnergy <= 0;
        }

        private void NotifyResourceChanges()
        {
            OnFoodChanged?.Invoke(currentFood, maxFood);
            OnWaterChanged?.Invoke(currentWater, maxWater);
            OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
        }
    }

    public enum ResourceType
    {
        Food,
        Water,
        Energy
    }
}
