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
var roomNum;

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

//Deletes any rooms associated with user before starting
$.get("/api/users/me", function (data) {
  var deleteRoom = data.id

  $.ajax({
    method: "DELETE",
    url: "/api/users/" + deleteRoom
  }).then(function () {
    console.log("Room associated with user has been cleared");
  });
});

/////////////////////////////////////////////

//CLICK FUNCTION TO START CHAT
$("#startButton").on("click", function () {

  //Get userid and store it here
  $.get("/api/users/me", function (data) {
    //GRABS USER'S ID NUMBER
    var user = data.id;

    $.get("/api/rooms", function (data) {
      if (data[0] === undefined || data[0].length === 0) {
        console.log("No available rooms. Creating new room...");
        //NEED TO DELETE ROOM IN DATABASE WHEN USER EXITS

        //start the loading circle
        $("#loadingCircle").removeClass("hide");

        var user1 = {
          user_id1: user,
          user_id2: null
        };

        $.post("/api/rooms", user1)
          // on success, run this callback
          .then(function (data) {
            // log the data we found
            console.log(data);
            console.log("Adding new room to database...");
            startChat(data.id);

            var roomNum = data.id;
            return roomNum;
          });
      } else if (data[0]) {
        console.log("Room available!! Entering now...");

        $("#loadingCircle").addClass("hide");

        roomNum = data[0][0].id;
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

        startChat(roomNum);
        return roomNum;
      }
    });
  });
});

$("#hangupButton").on("click", function () {
  $.ajax({
    method: "DELETE",
    url: "/api/rooms/" + roomNum
  }).then(function () {
    console.log("Room has been deleted...");
    location.reload();
  });
});

function startChat(roomNum) {
  var room = roomNum;

  room.toString();

  hangupButton.prop("disabled", false);
  startButton.prop("disabled", true);

  if (room !== "") {
    socket.emit("create or join", room);
    console.log("Attempted to create or join room", room);
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

    ///timer for switching to next chat. Change to 60 secs once we have everything
    setTimeout(function () {
      console.log("Time up!");

      $.ajax({
        method: "DELETE",
        url: "/api/rooms/" + room
      }).then(function () {
        console.log("Room has been deleted.");
      });
      location.reload();
    }, 60000);
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
}
//////////////////////////////////////////////////////////////////////
//USED FOR CHAT
//////////

function sendMessage(message) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

socket.on("message", function (message) {
  if (message === "bye") {
    $.ajax({
      method: "DELETE",
      url: "/api/rooms/" + roomNum
    }).then(function () {
      console.log("Room has been deleted...");
    });
  }
});

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
