import React from 'react'
import { useEffect, useContext , useCallback,useState} from 'react'
import { useParams } from 'react-router-dom'
import { SocketContext } from '../provider/Socket';
import { usePeer } from '../provider/Peer';
import ReactPlayer from 'react-player';

function Room() {
const [mystream,setMyStream] = useState(null);
   const { socket } = useContext(SocketContext);
  const { roomId } = useParams();
  const {peer,createoffer ,creaeanswer , setRemoteAns , sendStream} = usePeer();

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    sendStream(mystream);  // *** Dont know this part
    setMyStream(stream);
  }, []);

  // useCallback is used to memoize the function so that it will not create the new function , it will decrease the memory usage
  const handleNewUserJoinedRoom = useCallback( 
    async (emailId) => {
      const offer = await createoffer();
      // as the createoffer will return the offer so we will send the offer to the new user who joined the room
      // here we emiting all **** this must be wrong
      socket.emit('call-new-user',{emailId,offer}); // A is callling B
  },[createoffer,socket]);

  const handleIncomingCall = useCallback(async (from, offer) => {
    console.log("Incoming call from:", from , offer); 
     const answer =  await creaeanswer(offer);
    // now emmit the answer to the user who called us
          // here we emiting all **** this must be wrong 
    socket.emit('call-accepted',{emailId:from,answer}); // B is accepting the call from A , and sending the answer
  }, []);

  const handleCallAccepted = useCallback(async (answer,emailId) => { 

    await setRemoteAns(answer);

    console.log("Call accepted by user Ans is :", answer);
  }, [setRemoteAns]);

  useEffect(() => {
     if (!socket) {
      console.log("Socket is not connected yet.");
      return;
     }
    socket.on("new-user-joined-room", ({ emailId }) => {
      // console.log(" New User Joined this room email :", emailId);
      handleNewUserJoinedRoom(emailId);
    });

    socket.on("incomming-call", ({ from, offer }) => {
        handleIncomingCall(from, offer);
    });

   socket.on("call-accepted-by-user", async ({ answer , emailId}) => {
      // console.log("Call accepted by user:", answer);
    //  await peer.setRemoteDescription(answer); 
    handleCallAccepted(answer,emailId);
    });
// we need to remove the event listener when the component is unmounted , else we wll get multiple call when the component is mounted again
    return () => {
      socket.off("new-user-joined-room");
      socket.off("incomming-call");
      socket.off("call-accepted-by-user");
    }
  }, [socket]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <>
    <div> Thi is Rom {roomId}</div>
    <ReactPlayer url={mystream} playing muted/>
    </>
  )
}

export default Room