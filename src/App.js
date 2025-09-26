import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { FiCamera } from 'react-icons/fi'; 
import { FiTrash2 } from 'react-icons/fi'; 
import { FiLogOut, FiClock, FiMessageSquare } from 'react-icons/fi'; 
import { FaTshirt } from 'react-icons/fa'; 
import Webcam from 'react-webcam';
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Route, Routes, Navigate } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Signup from './Signup'; 
import Login from './Login'; 
import History from './History';
import Feedback from './Feedback';

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCamera, setShowCamera] = useState(false); 
  const [showConfirmation, setShowConfirmation] = useState(false); 
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); 
  const [showItemView, setShowItemView] = useState(false); 
  const [capturedImage, setCapturedImage] = useState(null); 
  const [selectedOption, setSelectedOption] = useState(''); 
  const [newCollectionName, setNewCollectionName] = useState(''); 
  const [collectionToDelete, setCollectionToDelete] = useState(null); 
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null); 
  const [showRecommendationModal, setShowRecommendationModal] = useState(false); 
  const [eventType, setEventType] = useState(''); 
  const [showLoadingModal, setShowLoadingModal] = useState(false); 
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const [user, setUser] = useState(null); 
  const [showDropdown, setShowDropdown] = useState(false); 
  const [showWeatherDialog, setShowWeatherDialog] = useState(false); 
  const [weatherTemp, setWeatherTemp] = useState(null); 
  const [weatherCondition, setWeatherCondition] = useState(''); 
  const [recommendedItems, setRecommendedItems] = useState({ tshirt: null, jeans: null }); 
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setCollections([]);
      return;
    }

    const userCollectionsRef = collection(db, `users/${user.uid}/collections`);
    const unsubscribe = onSnapshot(userCollectionsRef, (snapshot) => {
      const userCollections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(userCollections);
    }, (error) => {
      console.error('Error fetching collections:', error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const recommendOutfit = () => {
    if (!user) {
      navigate('/signup');
    } else {
      setShowRecommendationModal(true);
    }
  };

  const handleRecommendationSubmit = (e) => {
    e.preventDefault();
    if (!user || !eventType) return;

    setShowRecommendationModal(false);
    setShowLoadingModal(true);

    const recommendation = `Suggested outfit for ${eventType}: [Placeholder - Add your logic here]`;
    addDoc(collection(db, `users/${user.uid}/recommendations`), {
      eventType,
      recommendation,
      timestamp: serverTimestamp(),
    }).then(() => {
      setEventType('');
    }).catch((error) => {
      console.error('Error saving recommendation:', error);
    });
  };

  useEffect(() => {
    let progress = 0;
    if (showLoadingModal) {
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setShowLoadingModal(false);
          // Fetch weather and recommend items after loading
          fetchWeatherAndRecommend();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLoadingModal]);

  const fetchWeatherAndRecommend = async () => {
    try {
      // Fetch current temperature and weather condition for Lagos, Nigeria
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Lagos&appid=b6652dd9216d29536e54701b8004d56a&units=metric`);
      const data = await response.json();
      setWeatherTemp(data.main.temp);

      // Determine weather condition
      const condition = data.weather[0].main.toLowerCase();
      let displayCondition = '';
      if (condition.includes('clear')) {
        displayCondition = 'sunny ☀️';
      } else if (condition.includes('rain')) {
        displayCondition = 'rainy 🌧️';
      } else if (condition.includes('clouds')) {
        displayCondition = 'cloudy ☁️';
      } else {
        displayCondition = 'unknown 🌫️';
      }
      setWeatherCondition(displayCondition);

      // Recommend items from T-shirts and Jeans Trouser collections
      const tshirtCollection = collections.find(col => col.name.toLowerCase() === 't-shirts');
      const jeansCollection = collections.find(col => col.name.toLowerCase() === 'jeans trouser');
      setRecommendedItems({
        tshirt: tshirtCollection?.items[0]?.image || null,
        jeans: jeansCollection?.items[0]?.image || null,
      });
      setShowWeatherDialog(true);
    } catch (error) {
      console.error('Error fetching weather or recommending items:', error);
    }
  };

  useEffect(() => {
    let progress = 0;
    if (showLoadingModal) {
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setShowLoadingModal(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLoadingModal]);

  const filteredCollections = collections
    .filter(collection => collection.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const capture = () => {
    if (!user) {
      navigate('/signup');
    } else {
      setShowCamera(true);
    }
  };

  const handleConfirmChoice = async () => {
    if (!user) return;

    try {
      if (selectedOption === 'new' && newCollectionName) {
        const newCollection = {
          name: newCollectionName,
          items: [{ id: Date.now().toString(), name: 'Captured Item', type: 'unknown', image: capturedImage }],
          timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, `users/${user.uid}/collections`), newCollection);
        setShowConfirmation(false);
      } else if (selectedOption === 'existing' && selectedCollection) {
        const collectionRef = doc(db, `users/${user.uid}/collections`, selectedCollection);
        const collectionData = collections.find(col => col.id === selectedCollection);
        const newItem = { id: Date.now().toString(), name: 'Captured Item', type: 'unknown', image: capturedImage };
        await updateDoc(collectionRef, {
          items: [...collectionData.items, newItem],
          timestamp: serverTimestamp(),
        });
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error('Error handling confirm choice:', error);
    }

    setSelectedOption('');
    setNewCollectionName('');
    setCapturedImage(null);
  };

  const handleDeleteConfirm = async (confirm) => {
    if (confirm && collectionToDelete && user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/collections`, collectionToDelete));
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
    setShowDeleteConfirmation(false);
    setCollectionToDelete(null);
  };

  const handleItemDeleteConfirm = async (confirm) => {
    if (confirm && itemToDelete && selectedCollection && user) {
      try {
        const collectionRef = doc(db, `users/${user.uid}/collections`, selectedCollection);
        const collectionData = collections.find(col => col.id === selectedCollection);
        const updatedItems = collectionData.items.filter(item => item.id !== itemToDelete);
        await updateDoc(collectionRef, { items: updatedItems, timestamp: serverTimestamp() });
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
    setSelectedItem(null);
    setShowItemView(false);
  };

  const getInitials = () => {
    if (!user) return '';
    const name = user.displayName || user.email || '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              {/* ...your main app content here... */}
              <>
                <header className="bg-blue-500 text-white p-4 flex items-center justify-between relative">
                  <h1 className="text-2xl">Virtual Wardrobe System</h1>
                  {user && (
                    <div className="relative">
                      <div
                        className="w-10 h-10 bg-white text-blue-500 rounded-full flex items-center justify-center font-bold cursor-pointer"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        {getInitials()}
                      </div>
                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-blue-500 rounded-lg shadow-md z-50">
                          <ul className="py-1">
                            <li
                              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={handleSignOut}
                            >
                              <FiLogOut className="mr-2" /> Log Out
                            </li>
                            <li
                              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setShowDropdown(false);
                                navigate('/history');
                              }}
                            >
                              <FiClock className="mr-2" /> History
                            </li>
                            <li
                              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setShowDropdown(false);
                                navigate('/feedback');
                              }}
                            >
                              <FiMessageSquare className="mr-2" /> Feedback
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </header>

                <main className="container mx-auto p-4">
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <input
                      type="text"
                      placeholder="Search your collections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <h2 className="text-xl font-semibold mb-4">Your Collection</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredCollections.map((collection) => (
                        <div
                          key={collection.id}
                          className="bg-gray-200 rounded-lg shadow-md aspect-square p-2 relative cursor-pointer"
                          onClick={() => {
                            setSelectedCollection(collection.id);
                            setShowItemView(true);
                          }}
                        >
                          <div className="h-full flex flex-col items-center justify-center">
                            {collection.items.length > 0 && collection.items[0].image && (
                              <img src={collection.items[0].image} alt={collection.items[0].name} className="w-full h-3/4 object-cover rounded-t-lg" />
                            )}
                            <h3 className="text-sm font-bold text-blue-600 text-center mt-1">{collection.name}</h3>
                          </div>
                          <div className="absolute top-1 right-1">
                            <FiTrash2
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCollectionToDelete(collection.id);
                                setShowDeleteConfirmation(true);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </main>

                {user && (
                  <div className="fixed bottom-20 left-4">
                    <button
                      onClick={capture}
                      className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg focus:outline-none"
                    >
                      <FiCamera className="text-2xl" />
                    </button>
                  </div>
                )}

                {user && (
                  <div className="fixed bottom-20 right-4">
                    <button
                      onClick={recommendOutfit}
                      className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg focus:outline-none"
                    >
                      <FaTshirt className="text-2xl" />
                    </button>
                  </div>
                )}

                {showCamera && user && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full max-w-md"
                      />
                      <div className="mt-4 flex justify-center space-x-4">
                        <button
                          onClick={() => {
                            const imageSrc = webcamRef.current.getScreenshot();
                            setCapturedImage(imageSrc);
                            setShowCamera(false);
                            setShowConfirmation(true);
                          }}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                          Capture
                        </button>
                        <button
                          onClick={() => setShowCamera(false)}
                          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showConfirmation && capturedImage && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4 text-center">Add Captured Item</h3>
                      <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover mb-4 rounded" />
                      <div className="mb-4">
                        <label className="block mb-2">Choose an option:</label>
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select an option</option>
                          <option value="existing">Add to Existing Collection</option>
                          <option value="new">Create New Collection</option>
                        </select>
                      </div>
                      {selectedOption === 'existing' && (
                        <div className="mb-4">
                          <label className="block mb-2">Select Collection:</label>
                          <select
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a collection</option>
                            {collections.map((collection) => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {selectedOption === 'new' && (
                        <div className="mb-4">
                          <label className="block mb-2">Collection Name:</label>
                          <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Enter collection name"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleConfirmChoice}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                          disabled={!selectedOption || (selectedOption === 'existing' && !selectedCollection) || (selectedOption === 'new' && !newCollectionName)}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setShowConfirmation(false);
                            setSelectedOption('');
                            setNewCollectionName('');
                            setCapturedImage(null);
                          }}
                          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showDeleteConfirmation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h1 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h1>
                      <p className="mb-4 text-center">Are you sure?</p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => (itemToDelete ? handleItemDeleteConfirm(true) : handleDeleteConfirm(true))}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => (itemToDelete ? handleItemDeleteConfirm(false) : handleDeleteConfirm(false))}
                          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showItemView && selectedCollection && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        {collections.find(col => col.id === selectedCollection)?.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {collections
                          .find(col => col.id === selectedCollection)
                          ?.items.map((item) => (
                            <div
                              key={item.id}
                              className="relative"
                              onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              )}
                              {selectedItem === item.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg w-24">
                                  <FiTrash2
                                    className="text-red-500 cursor-pointer hover:text-red-700 text-3xl"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemToDelete(item.id);
                                      setShowDeleteConfirmation(true);
                                      setShowItemView(false);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => {
                            setShowItemView(false);
                            setSelectedItem(null);
                          }}
                          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showRecommendationModal && user && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4 text-center">What kind of event are you attending?</h3>
                      <form onSubmit={handleRecommendationSubmit}>
                        <input
                          type="text"
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          placeholder="Enter event type (e.g., Wedding, Party)"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <div className="flex justify-center space-x-4">
                          <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            disabled={!eventType}
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => {
                              setShowRecommendationModal(false);
                              setEventType('');
                            }}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {showLoadingModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
                      <h3 className="text-lg font-semibold mb-4">Relax the system is analyzing the weather ☀️ and your collections</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {showWeatherDialog && user && weatherTemp !== null && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
                      <h3 className="text-lg font-semibold mb-4">Current Weather</h3>
                      <p className="mb-4">{weatherCondition}</p>
                      <p className="mb-4">Temperature: {weatherTemp}°C</p>
                      <p className="mb-4">I recommend you wear this:</p>
                      <div className="flex justify-center space-x-4 mb-4">
                        {recommendedItems.tshirt && (
                          <img src={recommendedItems.tshirt} alt="Recommended T-shirt" className="w-24 h-24 object-cover rounded-lg" />
                        )}
                        {recommendedItems.jeans && (
                          <img src={recommendedItems.jeans} alt="Recommended Jeans" className="w-24 h-24 object-cover rounded-lg" />
                        )}
                      </div>
                      <button
                        onClick={() => setShowWeatherDialog(false)}
                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<History />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </div>
  );
}

export default App;