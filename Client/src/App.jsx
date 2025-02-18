import { useState } from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import { SocketProvider } from './provider/Socket.jsx'
import { PeerProvider } from './provider/Peer.jsx'
import './App.css'
import Room from './pages/Room.jsx'

function App() {
 

  return (
    <>
     <SocketProvider>
      <PeerProvider>
    <Routes>
     
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/room/:roomId' element={<Room/>} />
  
    </Routes>
    </PeerProvider>
    </SocketProvider>
    </>
  )
}

export default App
