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



User should see all the users cards except 
0. his own card
1. his already connection
2. ignored people
3. already send the connection request

eg: Rahul =[Mark, Donald, MS DHoni, Virat]  //people whose card still will be seen
Rahul-> Akshay -> rejected    Rahul-> elon -> accepted 
elon-> will see all but except Rahul (they are already connected)
Akshay-> will not see Rahul because rahul has already rejected 

These profile shouldn't be shown in rahul feed (if the entry is made in the connection req model then it should not be shown whether its accepted/rejected)



* we should add "pagination" that if the new user gets onboarded 
    - When the user goes on feed API the db should not return => 999 records from the DB => only return 10 users and then next 10 (add Pagination)


Pagination => 

/feed?page=1&limit=10 => first 10 users   Page 1: skip(0).limit(10) → Returns documents 1-10
/feed?page=2&limit=10 => 11-20  Page 2: skip(10).limit(10) → Returns documents 11-20
/feed?page=3&limit=10 => 21-30 Page 3: skip(20).limit(10) → Returns documents 21-30

in mongo DB we have 2 methods 
1. skip() => Purpose: Skips a specified number of documents in a query
Syntax: skip(n) where n is the number of documents to skip
Usage: Usually calculated based on page number and limit
Formula: skip = (pageNumber - 1) * limit
Example: For page 2 with 10 items per page:  
await User.find().skip(10).limit(10)  // Skips first 10 documents and returns next 10

2. limit() => Purpose: Limits the number of documents returned in a query
Syntax: limit(n) where n is the maximum number of documents to return
Example: If you want to show 10 users per page: 
await User.find().limit(10)  // Returns only 10 documents


How They Work Together for Pagination
Let's say you have 100 users and want to implement pagination with 10 users per page:

const page = 2; // Page number from query params
const limit = 10; // Items per page
const skip = (page - 1) * limit; // Calculate how many documents to skip

// This will skip first 10 documents and return next 10
const users = await User.find()
    .skip(skip)  // Skip 10 documents
    .limit(limit); // Return 10 documents


For different pages:



