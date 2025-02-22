import React from 'react'
import { SocketContext } from "../context/Socket";
import { useState, useContext, useEffect  , useCallback} from 'react'
import ReactPlayer from 'react-player'
import peer from '../webrtc/peer'
import { useLocation } from 'react-router-dom';

function Room() {
  // const roomId = useParams()
  const location = useLocation();
  const myEmail = location.state?.email;
    const [remoteEmail, setRemoteEmail] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const[remoteStream, setRemoteStream] = useState(null);
  const { socket } = useContext(SocketContext);

  const handleNewUserJoinedRoom = useCallback((data) =>{
    const {emailId , socketId} = data;
    console.log("New User Joined Room" , emailId, socketId);
    setRemoteEmail(emailId);
    setRemoteSocketId(socketId);
  },[]) 

  const handleCallUser = useCallback( async() => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const offer = await peer.getOffer();
    if(!remoteSocketId ) console.log("Remote Socket Id is not present");
    if(!offer) console.log("offer not present ")
      // ********************** emailId from params
    if(!myEmail)console.log("No email Found from Location [ user a ]")
      else console.log("User A's email" , myEmail)
    socket.emit("call-new-user", { socketId: remoteSocketId , offer ,emailId : myEmail }); // A is calling B [ from A remote email is B's email ]
    setMyStream(stream);
  },[remoteSocketId, socket])

  const handleIncommingCall = useCallback(async (data) => {
    const { offer , socketId , emailId } = data; // this is A's socket ID , emailId is A's ID 
    if(emailId)console.log("No Email from Handle Incomg call")
      if(socketId)console.log("No sockt id from Handle Incomg call")
    setRemoteSocketId(socketId);
    setRemoteEmail(emailId);
    console.log("Incomming Call", offer, socketId);
    // before creating ans turn on useer B's cam
     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
     setMyStream(stream)
    const answer = await peer.getAnswer(offer);
    if(!answer)console.log("No Answer HandleIncommigCallFun")
    socket.emit("call-accepted",{answer,socketId})
    
  } , [socket,myStream])

  const sendStrem = useCallback(()=>{
    for(const track of myStream.getTracks()){
          peer.peer.addTrack(track,myStream)
      }
  },[myStream])

  const handleFinalAns = useCallback((data)=>{
      const {answer} = data;
      peer.getRemoteDes(answer)
      console.log("call Accepted")
      sendStrem()
      // for(const track of myStream.getTracks()){
      //     peer.peer.addTrack(track,myStream)
      // }
  },[sendStrem])  //**** */

    useEffect(() => {
      peer.peer.addEventListener('track', async (ev)=>{
        const remoteStrm = ev.streams;
        console.log("GOT TRACKS")
        console.log(remoteStream);
        setRemoteStream(remoteStrm[0]) // take the 0th steam as it is array of audio vid  screnshare ..
      });
      // peer is the object name of peerClass  & inside that object we have peer [ peer is the object of RTCPeerConnection]
    }, []);


//  All NegoTiation Function 
      const handleNegoNeede = useCallback(
      async()=>{
          const offer = await peer.getOffer();
          socket.emit('peer:nego:needed',{offer,remoteSocketId})
      },[remoteSocketId,socket])

    const handleIncommingNego = useCallback( async(data)=>{
        const {offer,from} = data;
        const answer = await peer.getAnswer(offer);
        socket.emit('peer:nego:done',{to:from , answer})
    } , [socket] )

    const handleFinalNego = useCallback( async(data)=>{
      const {answer} = data;
      // peer.getRemoteDes(answer) // ********** is it local or remote ,confused
      //  await peer.setLocalDescription(answer) // it is LocalDes but dont know why **************************
      await peer.peer.setRemoteDescription(answer) 
      //  setRemoteDescription
    } , [ socket])




    useEffect(()=>{
      peer.peer.addEventListener('negotiationneeded',handleNegoNeede)
      return()=>{
        peer.peer.removeEventListener('negotiationneeded',handleNegoNeede)
      }
    },[handleNegoNeede])

  useEffect(() => {
    socket.on("new-user-joined-room", handleNewUserJoinedRoom)
    socket.on("incomming-call", handleIncommingCall)
    socket.on("finala-ans",handleFinalAns)
    socket.on("peer:nego:incomming",handleIncommingNego);
    socket.on("peer:nego:final",handleFinalNego )
    return () => {
      socket.off("new-user-joined-room", handleNewUserJoinedRoom)
      socket.off("incomming-call", handleIncommingCall)
      socket.off("finala-ans",handleFinalAns)
       socket.off("peer:nego:incomming",handleIncommingNego);
      socket.off("peer:nego:final",handleFinalNego )
    }
  }, [socket, handleNewUserJoinedRoom,handleIncommingCall,handleFinalAns , handleIncommingNego,handleFinalNego])

  return (

      <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-800">Room Page</h1>
      </header>

      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          {remoteEmail ? (
            <div className="text-lg text-green-600">
              {remoteEmail} joined the room
            </div>
          ) : (
            <h2 className="text-lg text-red-500">No User Joined Yet</h2>
          )}
        </div>

        {remoteEmail && (
          <div className="mb-4">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
              onClick={handleCallUser}
            >
              Call User
            </button>
          </div>
        )}

        {myStream && (
          <div className="mb-4">
            <button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
              onClick={sendStrem}
            >
              Send Stream
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-around items-center gap-4">
          {myStream && (
            <div className="w-full md:w-1/2">
              <ReactPlayer
                className="rounded-lg"
                url={myStream}
                playing
                muted
                width="100%"
                height="auto"
              />
            </div>
          )}

          {remoteStream && (
            <div className="w-full md:w-1/2">
              <div className="text-center text-2xl font-semibold text-amber-700 mb-2">
                Remote Stream
              </div>
              <ReactPlayer
                className="rounded-lg"
                url={remoteStream}
                playing
                muted
                width="100%"
                height="auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Room


 //   <>
  //   <div className='bg-amber-300 ' > This is Room Page</div>
   
  //  {
  //   remoteEmail ? <div>{remoteEmail} joined the room </div> : <h2> No User Joined Yet</h2>
  //  }

  //  {
  //   remoteEmail && <button className='text-xl bg-amber-700' onClick={handleCallUser}> Call User  </button>
  //  }

  //  {
  //   myStream && <button onClick={sendStrem} > Send Stream </button>
  //  }

  //  {
  //   myStream && <ReactPlayer className="h-32 w-35" url={myStream} playing muted />
  //  }
  //  {
  //   remoteStream && <h1 className='text-3xl bg-amber-700'> Remote Stream </h1>
  //  }
  //  {
  //   remoteStream && <ReactPlayer className="h-32 w-35 " url={remoteStream} playing muted />
  //  }


  // </>