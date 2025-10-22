interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  isActive: boolean;
  onClick: (categoryId: string) => void;
}

export default function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-orange-300 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className={`text-4xl transition-transform duration-300 group-hover:scale-110 ${
          isActive ? 'drop-shadow-lg' : ''
        }`}>
          {category.icon}
        </div>
        <span className="text-sm font-semibold text-center">{category.name}</span>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  );
}