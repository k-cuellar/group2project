//////////////////////////////////////////////////////////////////////
//USED FOR VIDEO PEER-TO-PEER
//////////

("use strict");

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
// var turnReady;
var hangupButton = $("#hangupButton");
var startButton = $("#startButton");

var pcConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};

var socket = io.connect();

// Set up audio and video regardless of what devices are present.
// var sdpConstraints = {
//   offerToReceiveAudio: true,
//   offerToReceiveVideo: true
// };

/////////////////////////////////////////////

// var room = "foo";
// Could prompt for room name:
//CLICK FUNCTION TO START CHAT
$("#startButton").on("click", function () {

  //Get userid and store it here
  var user = 1;

  $.get("/api/rooms/" + user, function (data) {
    if (data[0] === undefined || data[1].length === 0) {
      console.log("Nothing is here");

      ///INSERT POST REQUEST HERE

      //NEED TO DELETE ROOM IN DATABASE WHEN USER EXITS

      var user1 = {
        user_id1: user,
        user_id2: null
      };

      $.post("/api/rooms", user1)
        // on success, run this callback
        .then(function (data) {
          // log the data we found
          console.log(data);
          console.log("Added new room to database...");
        });

    } else {
      console.log("Something is here!!");

      var roomNum = data[0][0].id;
      console.log(roomNum);

      var user2 = {
        user_id2: user
      };

      $.ajax({
        method: "PUT",
        url: "/api/rooms/" + roomNum,
        data: user2
      }).then(function (data) {
        console.log("UPDATED!!!!");
      });
    }
  });

  var room = prompt("Enter room name:");

  hangupButton.prop("disabled", false);
  startButton.prop("disabled", true);

  if (room !== "") {
    socket.emit("create or join", room);
    console.log("Attempted to create or  join room", room);
  }

  socket.on("created", function (room) {
    console.log("Created room " + room);

    //console log in id of socket
    console.log("Socket ID: " + socket.id);
    isInitiator = true;
  });

  socket.on("full", function (room) {
    console.log("Room " + room + " is full");
  });

  socket.on("join", function (room) {
    console.log("Another peer made a request to join room " + room);
    console.log("This peer is the initiator of room " + room + "!");
    isChannelReady = true;
  });

  socket.on("joined", function (room) {
    console.log("joined: " + room);
    isChannelReady = true;
  });

  socket.on("log", function (array) {
    console.log.apply(console, array);
  });

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .then(gotStream)
    .catch(function (e) {
      alert("getUserMedia() error: " + e.name);
    });

  ///timer for switching to next chat. Change to 60 secs once we have everything
  // setTimeout(function() {
  //   location.reload();
  // }, 3000);
});

$("#hangupButton").on("click", function () {
  location.reload();
});

//////////////////////////////////////////////////////////////////////
//USED FOR CHAT
//////////

function sendMessage(message) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

// This client receives a message
socket.on("message", function (message) {
  console.log("Client received message:", message);
  if (message === "got user media") {
    maybeStart();
  } else if (message.type === "offer") {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === "answer" && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === "candidate" && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === "bye" && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");

navigator.mediaDevices
  .getUserMedia({
    audio: false,
    video: true
  })
  .then(gotStream)
  .catch(function (e) {
    alert("getUserMedia() error: " + e.name);
  });

function gotStream(stream) {
  console.log("Adding local stream.");
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage("got user media");
  if (isInitiator) {
    maybeStart();
  }
}

var constraints = {
  video: true
};

console.log("Getting user media with constraints", constraints);

if (location.hostname !== "localhost") {
  requestTurn(
    "https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913"
  );
}

function maybeStart() {
  console.log(">>>>>>> maybeStart() ", isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== "undefined" && isChannelReady) {
    console.log(">>>>>> creating peer connection");
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log("isInitiator", isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function () {
  sendMessage("bye");
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log("Created RTCPeerConnnection");
  } catch (e) {
    console.log("Failed to create PeerConnection, exception: " + e.message);
    alert("Cannot create RTCPeerConnection object.");
    return;
  }
}

function handleIceCandidate(event) {
  console.log("icecandidate event: ", event);
  if (event.candidate) {
    sendMessage({
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log("End of candidates.");
  }
}

function handleCreateOfferError(event) {
  console.log("createOffer() error: ", event);
}

function doCall() {
  console.log("Sending offer to peer");
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log("Sending answer to peer.");
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log("setLocalAndSendMessage sending message", sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace("Failed to create session description: " + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === "turn:") {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log("Getting TURN server from ", turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log("Got TURN server: ", turnServer);
        pcConfig.iceServers.push({
          urls: "turn:" + turnServer.username + "@" + turnServer.turn,
          credential: turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open("GET", turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log("Remote stream added.");
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log("Remote stream removed. Event: ", event);
}

function handleRemoteHangup() {
  console.log("Session terminated.");
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}
