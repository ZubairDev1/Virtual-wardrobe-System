// src/components/Navbar.jsx
function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">WardrobeApp</h1>
        <ul className="flex space-x-4">
          <li><a href="#" className="hover:text-gray-200">Home</a></li>
          <li><a href="#" className="hover:text-gray-200">Wardrobe</a></li>
          <li><a href="#" className="hover:text-gray-200">Add Item</a></li>
          <li><a href="#" className="hover:text-gray-200">Profile</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;