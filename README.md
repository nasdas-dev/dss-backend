
# DSS Backend


Clone the repository and run the project with

```
 npm start
```


## Link to Presentations



Midterm - https://docs.google.com/presentation/d/e/2PACX-1vSEpjDjAOkd5vd4rnjo_dUE6o0SDFWMJWUJ-4pr9bJFCc2sIkd0fulm3L8qAldzUa16diRihBTMxc3F/pub?start=false&loop=false&delayms=3000

Final - https://docs.google.com/presentation/d/e/2PACX-1vSfrcH1qfxlRcbm92ImdmYaa9vrAC958CBPArQGx7BIIdzdht09sQyugp-k8AHL6QH1fcdIVpJ_oQJO/pub?start=false&loop=false&delayms=3000

## Architecture

![Backend Architecture](https://i.imgur.com/J7bdrxb.png)


## FAQ

#### How do I connect to the db? 
Be sure to setup the config.env file, explained below.


#### How do I add new questions to the db?

STEP 1:

Create / Modify a data.json payload in the root of the project with the following structure (an example is included in the repo):

```json
[
  {
    "id": INT_QUESTIONID,
    "category": STRING_CATEGORY-OF-QUESTION,
    "question": STRING_QUESTION,
    "answerType": ENUM(FF,SC,MC)_TYPE-OF-QUESTION,
    "answers": [OBJECT_ARRAY]_ANSWERS,
    "resultMap": [OBJECT_ARRAY]_RESULT-MAPPING,
    "bestpractice": STRING_SOLUTION-ANSWER,
    "rationale": STRING_SOLUTION-EXPLANATION,
    "role": ENUM(admin,user)_QUESTION-SCOPE,
    "applicability": ENUM(org,indv)_QUESTION-ENVIRONMENT-SCOPE,
    "special_action": STRING_SPECIAL-FUNCTION
  },

```

STEP 2:

Load the new questions into the db by running following command in the terminal:
```console
node index.js {DB_PASSWORD}
```


## config.env example

To establish connection to the MongoDB Atlas instance, it is important to add a config.env file to the root of the project.
Copy the template below and fill in your credentials.

```javascript
ATLAS_URI=mongodb+srv://{USERNAME}:{PASSWORD}@{MONGODBURI}?retryWrites=true&w=majority
PORT=3001
TOKEN_SECRET='TOKENSECRET'
PASSWORD='DBPASSWORD'
```

