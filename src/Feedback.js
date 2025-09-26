// src/Feedback.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function Feedback() {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit feedback.');
      return;
    }
    if (!feedback.trim()) {
      alert('Feedback cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/feedback`), {
        text: feedback,
        timestamp: serverTimestamp(),
      });
      setFeedback('');
      navigate('/');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold text-blue-600 mb-4">Submit Feedback</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows="4"
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!feedback.trim()}
          >
            Submit
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
      </form>
    </div>
  );
}

export default Feedback;