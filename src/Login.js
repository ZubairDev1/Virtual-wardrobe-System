import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false); // Track if reset email was sent
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = result.additionalUserInfo;

      if (additionalUserInfo?.isNewUser) {
        setError('This account is not registered. Please sign up first.');
        await auth.signOut();
      } else {
        console.log('Google login success:', user);
        navigate('/');
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/account-exists-with-different-credential') {
        setError('This account is not registered. Please sign up first.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      setError(error.message === 'Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found)' 
        ? 'No account is registered with this email. Please sign up first.' 
        : error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        
        {/* New greeting section */}
        <h1 className="text-3xl font-bold text-center mb-2">Hello again</h1>
        <p className="text-gray-600 text-center mb-6">
          Welcome back to your wardrobe
        </p>

        <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {resetSent && <p className="text-green-500 text-center mb-4">Password reset email sent. Check your inbox!</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
          >
            Login
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gray-500 text-white p-2 rounded flex items-center justify-center hover:bg-red-600 mb-4"
        >
          <FcGoogle className="mr-2" /> Login with Gmail
        </button>
        <div className="text-center">
          <button
            onClick={handleForgotPassword}
            className="text-blue-500 hover:underline mb-4"
          >
            Forgot Password?
          </button>
        </div>
        <p className="mt-4 text-center">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-blue-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
