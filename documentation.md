This will cover
1) Schema Design
2) user Authentication
3) Middleware Used
4) Code submission flow 
5) Cloudinary upload 
6) Ai integration 

Future implemenations 
1) Backend scalability 
2) Peer discussions
3) 1v1 coding battle (elo steal)

1) Schema Design 
This is a coding platform on seasonal basis, so the basic schema that are required are 
  user schema -> Contains user information, 
  problem schema -> Contains problem information with compound indexing seasonid, round, release day,
  season schema -> Contains season information including mongoose methods to calcuate current season day and current phase

for each season there is a leaderboard which stores ranks of each user 
  Leaderboard schema -> contains user information on relation with season id with an compound index for user id and season Id
  for each user it stores elo , correct and wrong submissions with the problems solved that season.
  Has an pre save hook to calculate elo change based on submission when using updateandsave so it updates elo right before saving the document.
  Has an virtual function to calculate current rank and tier based on elo ,accuracy , number of problems solved

In order to show user his/her submission history and keep a track of all the submissions done so far by the user 
  submission schema -> takes in user information , problem information and season information to create a submission document 
  It stores everything after a user hits the submit button including elo change etc

Misc schema 
  Announcement Schema->stores information of each type of announcement,
  VideoSolution Schema -> Stores information of the video solutions of problems


2) User Authentication
When user sends data from frontend to backend for signup , backend takes the password from the user and use bcrypt to hash it and then save it in the database.
To make frontend and backend remember information for future use, I use jwt tokens with an expiry date of 24h for now, so for next 24hr user dont need to login again and the token is sent to the frontend which is hidden in the cookie 
To handle logout I will extract the token from the user cookie and put it in redis untill the expiry time of the token. This way the token is still valid but since its in redis user cant use it again. When a user tries to login right after logging out it will generate a completely new jwt token 


3) Middleware used
User middleware/Admin middleware -> checks if token exists, if the user exists in the database, checks redis if the given token is present there, if all checks pass then it allows the function to continue and admin middleware has one extra check to make sure the user is admin.
phaseGuard middleware -> Restricts the user to allow access to only the allowed phases
Guest middleware -> Users arriving at this middlware will get directed to guest season 


4) Code submission flow
User submits his/her data to the backend which contains language and code to be submitted and problem id as params. I will be running this code in an safe environment which is e2b so that user can't harm the server.To submit this code I need to submit a valid C++ code which contains int main(),
but user sends in the format of Class solution... . So inorder to create a valid C++ code I need user code(class Solution...), driver code, bridge functions and nlohmann/json library to convert json strings to C++ objects. 
So i will first take the user code and driver code (both will be in the form of strings) concatenate them into a valid C++ code (check the problem utility function file) and then send it to the e2b sandbox 
First i would compile the code using gcc and if it fails i would send the error message to the frontend and return
If compilation is successful then I would start a loop over all the test cases and send each test case to e2b sandbox to run on the give code. 
Now each test case arrives in json format. Here driver code converts it into C++ objects using nlohmann/json library and then use bridge functions to create C++ instances such as trees , lists , 2d matrix in memory for the given test case. Now driver code will create an object for Class solution from the user code and and send that test case instance to the Object and returns the result to backend to verify
Once backend recives this result and compared with the expected result and if both are same passes test cases gets incremented by one and goes on to the next testcase.
If at any point the test case fails it stops the loop and marks the submission as failed
Once all test cases are done and backend checks that all test cases passed then it marks the submission as accepted and moves onto calculating elo and updating the leaderboard. 

example of the driver code I used in the frontend video on publishing the problem 
![alt text](image-1.png)
How test case looks like arriving at e2b 
{"root": [3,1,4,null,2], "k": 1}
brige functions are there in the problem utility file 

Even though this works perfectly fine for a single person it fails for multiple users (users > 20) , here are some drawbacks 
1) e2b allows to open only 20 sandboxes at a time so 21st user gets an error and wont be able to submit any code 
2) Time taken to arrive at the frontend and backend takes 200ms and compiling the code takes 2seconds thats 2.2 seconds to check if the given code is compiled and now if it passed the compilation test and when I send each test case to e2b lets say it takes 100ms for sending and recieving the result and if I have just 10 test case that would be 10*100ms = 1second so user will be getting his result after 2.2 +1 = 3.2seconds.So if n number of test cases then user will be getting the final verdict in 2.2 + (0.1*n) seconds

5) Cloudinary Upload
I will be uploading the video to cloudinary directly from frontend as sending video to backend storing there in ssd and then sending to cloudinary takes up twice the amount of time(minimum). So inorder to send from frontend I need to authenticate the sender.Cloudinary provides cloudinary cloud name, public key , private key. Also to upload videos I used the cloudinary video upload SDK which handle the streaming process and stuff. 
First backend will configure cloudinary and have the private key ,public key , cloud name in the environment variables. Now from admin panel will send a request to backend that i need to upload this video , backend configures with cloudinary and provides an signature(which is hash(using private key) of public id and timestamp)
Once frontend recives this signature with timestamp, public id and public key it sends request to cloudinary. 
Cloudinary takes that public key searches for private key in its database and then generates hash of the given public id and timestamp using the private key it found. Then compares it with the signature send by the user and if both match then it allows the user to upload the video.

I am using streaming process here so if network connection breaks then user has to send it again from the beginning.

Once the video has been uploaded I will save the meta data of the video solution in my Database (check SolutionVideo schema)

6) Ai integration 
I will be storing history and the code written in the monaco editor by the user in a global state such that history and written code will only be wiped out from user memory (or global state) when user refreshes the page or closes the tab. 
I will only be sending past 5 messages to the llm for now.
Implemented a problem cache in the backend server itself to reduce database calls for every request and only call for a new problem

7) Misc
Storing user information and current season information in a global state that will be fetched every time user refreshes the page or opens a new tab of the page 




