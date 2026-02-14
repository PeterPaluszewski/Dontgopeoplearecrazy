import { useGameStore } from '@/store/gameStore';
import type { Item } from '@/types/game';
import { Package, X } from 'lucide-react';

interface InventoryItemCardProps {
  item: Item;
  quantity: number;
  onUse: () => void;
  onDrop: () => void;
}

function InventoryItemCard({ item, quantity, onUse, onDrop }: InventoryItemCardProps) {
  const hasEffect = item.foodValue > 0 || item.waterValue > 0 || item.energyValue > 0;

  return (
    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm">{item.name}</h4>
          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
        </div>
        <span className="ml-2 px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded">
          ×{quantity}
        </span>
      </div>

      {/* Item effects */}
      {hasEffect && (
        <div className="flex gap-2 mb-2 text-xs">
          {item.foodValue > 0 && <span className="text-orange-400">🍕 +{item.foodValue}</span>}
          {item.waterValue > 0 && <span className="text-blue-400">💧 +{item.waterValue}</span>}
          {item.energyValue > 0 && <span className="text-yellow-400">⚡ +{item.energyValue}</span>}
        </div>
      )}

      {/* Item weight and type */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>Weight: {item.weight}kg</span>
        <span className="px-2 py-0.5 bg-gray-600 rounded text-gray-300">{item.itemType}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {hasEffect && (
          <button
            onClick={onUse}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
          >
            Use
          </button>
        )}
        <button
          onClick={onDrop}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
          title="Drop item"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function InventoryPanel() {
  const { inventory, updateResources, removeInventoryItem } = useGameStore();

  const totalWeight = inventory.reduce((sum, inv) => sum + inv.item.weight * inv.quantity, 0);
  const maxWeight = 25; // kg
  const weightPercentage = (totalWeight / maxWeight) * 100;
  const isOverweight = totalWeight > maxWeight;

  const handleUseItem = (item: Item) => {
    // Apply item effects
    updateResources(item.foodValue, item.waterValue, item.energyValue);
    removeInventoryItem(item.id, 1);
  };

  const handleDropItem = (itemId: string) => {
    removeInventoryItem(itemId, 1);
  };

  return (
    <div className="bg-gray-800/95 rounded-lg p-4 shadow-xl border border-gray-700 backdrop-blur-sm max-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Package size={20} />
          Inventory
        </h2>
        <span className="text-sm text-gray-400">
          {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Weight indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-400">Backpack Weight</span>
          <span className={`text-sm font-bold ${isOverweight ? 'text-red-400' : 'text-gray-300'}`}>
            {totalWeight.toFixed(1)}/{maxWeight} kg
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverweight ? 'bg-red-500' : weightPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, weightPercentage)}%` }}
          />
        </div>
        {isOverweight && (
          <p className="text-xs text-red-400 mt-1">⚠️ Overweight! Drop items to move faster.</p>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎒</div>
            <p className="text-gray-400 text-sm">Your backpack is empty</p>
            <p className="text-gray-500 text-xs mt-1">Find items at locations or purchase them</p>
          </div>
        ) : (
          inventory.map((inv) => (
            <InventoryItemCard
              key={inv.item.id}
              item={inv.item}
              quantity={inv.quantity}
              onUse={() => handleUseItem(inv.item)}
              onDrop={() => handleDropItem(inv.item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
