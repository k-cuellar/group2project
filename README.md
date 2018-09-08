# Chat N' Dash!

Chat with new friends from all over the globe! But do it quickly, you've only got 60 seconds!

### What does our app do?

Inspired by the web app Chatroulette, our app creates a Peer to Peer connection between two users. However, the video connection between the users is set at only 60 seconds before expiring, so the conversation has to roll quickly! If users enjoy the conversation, they are able to "Favorite" it, which is stored in our database. If the Favorite is mutual, the username and date of the chat get stored and displayed on the home page.

### New Components We Used

- Passport
  - Used for authentication. We used Google's Oauth to validate user information.
  - Used as middleware to protect any routes where user should be logged in to view.

- Socket.io
  - Used to create p2p connection between users.

- WebRTC
  - Used to create video feed for chat feature using Real Time Communications. 

### Future Features

In the future, we would want to improve the app in a few ways. At the top of the wish list, we want to include a text chat feature for the users to interact with eachother. We also think some ice-breakers might be nice for the chat feature, so possibly including some simple games like tic-tac-toe for the users to play is on the list. We would love to see the app become completely mobile-responsive, as well as creating proper branding for the app.