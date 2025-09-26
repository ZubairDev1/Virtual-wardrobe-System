// src/History.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function History() {
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const recommendationsRef = collection(db, `users/${user.uid}/recommendations`);
    const q = query(recommendationsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecommendations(recs);
    }, (error) => {
      console.error('Error fetching recommendations:', error);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold text-blue-600 mb-4">Recommendation History</h1>
      {recommendations.length === 0 ? (
        <p className="text-gray-500">No recommendations yet.</p>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => (
            <li key={rec.id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-blue-500">Event: {rec.eventType}</p>
              <p className="text-gray-600">Recommendation: {rec.recommendation}</p>
              <p className="text-sm text-gray-400">Date: {new Date(rec.timestamp?.toDate()).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  );
}

export default History;