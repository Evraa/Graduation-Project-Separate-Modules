import React from 'react'
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import CustomRouter from './router';
import { Provider } from 'react-redux'
import store from './redux/store'
import useSetUp from './hooks/useSetUp'
import NavBar from './components/common/NavBar/NavBar'
import { initializeIcons } from '@fluentui/font-icons-mdl2';



function App() {

  initializeIcons();
  useSetUp()
  return (
    <Provider store = {store}>
      <Router>
        <div className= 'App'>
          <NavBar />
          <CustomRouter/>
        </div>
      </Router>
    </Provider>
    
    
  );
}

export default App;
