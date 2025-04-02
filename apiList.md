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
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## userRouter
- GET /user/connections
- GET /user/request
- GET /user/feed    -Gets you the profile of other user on platform 



Status: ignore, interested, accepted, rejected 