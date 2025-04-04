# DevTinder's Api

## authRouter
- POST /signUp
- POST /login
- POST /logOut

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- Patch /profile/editPassword

## connectionRequestRouter
- POST /request/send/interested/:userId
- POST /request/send/ignore/:userId

=> POST /request/send/:status:userId  
1. This api is only for the "interested & ignored"   we must sent only interested /ignored through API not accepted and rejected 
2. Anushka has send the "interested" req to the virat once so it should not send the connection request AGAIN to the virat => will lead to double entry in mongoDB 
3. if anushka has send the connection request to the virat which is still in the "interested" phase => so a corner case is that virat can't send the connection req "interested" to the Anushka
4. the user can send the request to the user present in the database not to the random mongoDb ID
5. The user can not send request to itself


- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

=> POST /request/review/:status/:requestId
for e.g => Akshay(fromUserId) =>is sending "INTERESTED" Connection request to =>  Elon(toUserId)
1. validate the status (accepted/rejected)
2. is reciever(toUserId) is loggedIn => only elon should be able to accept/reject the request (no 3rd-party or akshay itself can accpept/reject the request) 
3. the status of connection should be in the "interested" state only than only the elon(toUserId) could accept/reject the request If the satus is "ignored" no one can change the request and send the connection  
4. requestId should be valid 

## userRouter
- GET /user/request/received
- GET /user/connections
- GET /user/feed    -Gets you the profile of other user on platform 



Status: ignore, interested, accepted, rejected 