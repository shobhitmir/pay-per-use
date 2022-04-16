import React, { useEffect } from 'react'
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import MovieScreen from './screens/MovieScreen';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import { auth } from './firebase';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, selectUser } from './features/userSlice';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      if (userAuth)
      {
        dispatch(login({
          uid : userAuth.uid,
          email: userAuth.email,
          public_key: user?.public_key
        }))
      }
      else
      {
        dispatch(logout())
      }
    })

    return unsubscribe
  }, [dispatch])
  

  return (
    <div className="App">
      <Router>
        {!user ? (
          <LoginScreen />
        ): (
          <Routes>
          <Route exact path="/info/:type/:id" element={<MovieScreen/>} />
          <Route exact path="/profile" element={<ProfileScreen/>} />
          <Route exact path="/" element={<HomeScreen/>} />
        </Routes>
        )}
    </Router>
    </div>
  );
}

export default App;
