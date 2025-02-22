class PeerClass{
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [{
               urls : [ "stun:stun.l.google.com:19302",
                 "stun:global.stun.twilio.com:3478" ]
                   }],
            });
        }
}

async getOffer(){
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription( new RTCSessionDescription(offer));
    return offer;
}

async getAnswer(offer){
    if(!offer){
      console.log("No offer from getAnswer Fun");
      return;
    }
    if(this.peer){
      await this.peer.setRemoteDescription(offer)
        const answer = await this.peer.createAnswer();
       await this.peer.setLocalDescription(new RTCSessionDescription(answer))
        return answer;
    }else{
      console.log("Peer is Note Initialize From getAnswer");
      return;
    }
}

async getRemoteDes(ans){
  if(!ans){
    console.log("no ans from getRemoteDes")
    return;
  }
  if(this.peer){
    await this.peer.setRemoteDescription(ans)
  }else{
    console.log("Peer is Note Initialize From getAnswer");
      return;
  }
}


}

const peer = new PeerClass();
export default peer;