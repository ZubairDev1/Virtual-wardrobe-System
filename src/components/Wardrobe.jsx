// src/components/Wardrobe.jsx
function Wardrobe({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
          <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-md mb-2" />
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-gray-600">{item.category}</p>
        </div>
      ))}
    </div>
  );
}

export default Wardrobe;