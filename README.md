# Notification Service

1. subscribe a user to the notifications. 
2. send notification to all the subscribed users, to a specific user or users. 
3. send sms to all the subscribed users, to a specific user or users. (you have to integrate with an sms provider)

## Instructions

To Run the Project:
* clone the repo or download it
* cd into the directory of the project from the terminal
* copy the content of the private key file you just downloaded into `serviceAccountKey.json`
* install all project dependencies with `npm install`
* run the project with `npm start` and it will be listening at localhost:3000
* test the project with `npm test`

***To Run the Service with Docker:***
* make sure that docker and docker-compose are installed.
* run `sudo docker-compose up` it will be listening at localhost:3000

The API contains following endpoints 

  1. /subscribe
     * /
  2. /notifications
     * /
     * /notifications/toAll
  3. /sms
     * /
     * /toAll
  


