

import { createContext, useState, useEffect,useContext,useMemo } from "react";

export const PeerContext = createContext();

export const usePeer = () => {
  return useContext(PeerContext);
}

export const PeerProvider = ({ children }) => {
 
  // RTCPeerConnection : as our machine dont know the public ip address of our machine so we need to use STUN server to get the public ip address of our machine



  // useMemo ensures that a single instance of RTCPeerConnection is created and memoized across renders of the component. This is important because you typically want to maintain a persistent connection throughout the component’s lifecycle without reinitializing it on every render.
  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [{
     urls : [ "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478" ]
  }],
  }), []);

  // createoffer fun will create the offer and set the local description of the peer , so that we can send the offer to the other user
  const createoffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }

const creaeanswer = async (offer) => {
  // set the remote description of the peer to the offer we got from the other user
    await peer.setRemoteDescription(offer);
    // create the answer and set the local description of the peer
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
}

const setRemoteAns = async (answer) => {
  await peer.setRemoteDescription(answer);
} 

const sendStream = async(stream)=>{
  // first get all the tracs from the stram 'then loop on the tracs & add in my peer
  const tracs = stream.getTracks();
  for(const track of tracs){
   peer.addTrack(track,stream);
  }    
}

  return (
    <PeerContext.Provider value={{ peer , createoffer , creaeanswer , setRemoteAns , sendStream}}>
      {children}
    </PeerContext.Provider>
  );
};