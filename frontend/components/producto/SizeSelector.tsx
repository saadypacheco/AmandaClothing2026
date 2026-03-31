interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  disabled?: boolean;
}

export function SizeSelector({ sizes, selectedSize, onSizeChange, disabled = false }: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Talla</h3>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            disabled={disabled}
            className={`py-3 px-4 text-sm font-medium rounded-md border transition-all ${
              selectedSize === size
                ? 'border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}