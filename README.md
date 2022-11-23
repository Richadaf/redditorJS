# Redditor API
Creates videos off a reddit post
## Installation

- Install NodeJS, MongoDB
- Install `npm` or `yarn`
- Clone this repo
- Create a directory called `output` at repo root
- Create 3 subdirectories inside `output` called `videos`, `audio`,`images`.
- Run `npm install` or `yarn` to install all dependencies.
- Reach out to either `@richadaf` or Slack channel for a `.env` file.
- Rename the `.env.example` file you just received to `.env`
- To Start MongoDB run `yarn run dev` or `npm run dev`

## Possible Errors

- If you see anything like `Error: listen EADDRINUSE: address already in use :::2000`
- This means that that particular port is currently in use. To solve this, just change the PORT number in your `.env` file to another PORT number.
- Check `http://localhost:YOUR_PORT_NUMBER/v1/status` to see it works
- Congratulations. Now you are all set to start the dashboard from the front-end to consume this API.

## Files Structure

```
.
├── README.md
├── package.json
└── src
    ├── config
    │   └── index.js
    ├── controllers
    │   └── redditor.controller.js
    ├── helpers
    │   ├── cronjob.js
    │   ├── index.js
    │   ├── jsdoc.js
    │   └── throbber.js
    ├── redditor.js
    ├── routes
    │   └── api
    │       └── index.js
    └── services
        ├── core
        │   ├── cron
        │   │   ├── manager.js
        │   │   └── multimedia.js
        │   ├── db
        │   │   └── mongoose.js
        │   ├── express.js
        │   └── queue
        │       ├── manager.js
        │       └── multimedia.js
        ├── multimedia
        │   └── index.js
        └── utils
            ├── ffmpeg.js
            ├── imager.js
            ├── reddit.js
            ├── sentry.js
            └── textToSpeech.**js**
```
As a contributor, the main files you will be working with are in `src`

### config

contains the environment variables.

### controllers

Contains the controllers of all the routes.

### middlewares

Contains middlewares mounted on each routes thats needs to be executed before the request reaches the intended route.

### models

Contains db schemas and models are defined here.

### routes

Contains the api end points definitions

### services

Contains services we've created and integrations with third-party libraries. It's sub-folders are:

#### core

this folder contains services that are essential to booting the server including:

##### db

contains third party solutions for initializing the database

#### utils

Third party libraries we use for our services

### validations

Contains definitions for validating the server's input data

## test

This is where we define our automated tests.

## Other Information

For more information or questions, reach out to:

- [@richadaf](https://github.com/richadaf)