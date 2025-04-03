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

## userRouter
- GET /user/connections
- GET /user/request
- GET /user/feed    -Gets you the profile of other user on platform 



Status: ignore, interested, accepted, rejected 