# API

Here you'll find APIs for CourseMate. The response will be in the form of JSON for every request.

The APIs are categorized into **Public**, **Private**, **Admin** and **SuperAdmin**.

-   Public APIs can be accessed by everyone
-   Private APIs are for logged in users
-   Admin APIs are to moderate the addition of new data
-   SuperAdmin APIs are to moderate the website

The database calls and handling of responses is done by controllers in `src/controllers` folder. The routes that use these controllers are in `src/routes`.

The HTTP Methods are used as specified by [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods). Here are the scenarios for when a HTTP Method is used.

-   **GET** - To retrieve data
-   **POST** - To add new data
-   **PUT** - To replace existing data
-   **PATCH** - To modify a part of existing data
-   **DELETE** - To remove data

## List of APIs

-   [Auth APIs](#auth-api)
-   [User APIs](#user-api)
-   [Tag APIs](#tag-api)
-   [Tutorial APIs](#tutorial-api)
-   [Track APIs](#track-api)
-   [Feedback APIs](#feedback-api)

### Auth API

##### GET Requests

```yml
Route: /auth/google
Description: Authenticates the user
Access: Public
```

```yml
Route: /auth/logout
Description: Logs out the user
Access: Private
```

[Go to API List ⬆](#list-of-apis)

### User API

##### GET Requests

```yml
Route: /api/user
Description: Returns current user info
Access: Private
```

```yml
Route: /api/user/submitted-tutorials
Description: Returns list of tutorials submitted by the user
Access: Private
```

```yml
Route: /api/user/favorites
Description: Returns list of tutorials marked as favorite by the user
Access: Private
```

```yml
Route: /api/user/tracks
Description: Returns list of tracks subscribed by the user
Access: Private
```

```yml
Route: /api/user/all-users
Description: Returns list of all users
Access: SuperAdmin
```

##### POST Requests

```yml
Route: /api/user/favorites/:tutorialId
Description: Adds the tutorial to the favorites
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Private
```

```yml
Route: /api/user/tracks/:trackId
Description: Subscribes the user to a track
RequestParams:
    trackId: MongoId of the track
Access: Private
```

##### PUT Requests

```yml
Route: /api/user/update
Description: Updates the name of the user
RequestBody:
    name: Updated name of the user
Access: Private
```

##### PATCH Requests

```yml
Route: /api/user/tracks/:trackId
Description: Updates progress of the given track
RequestParams:
    trackId: MongoId of the track
RequestBody:
    trackProgressIndex: The number by which the track is to be updated
Access: Private
```

```yml
Route: /api/user/admin-status
Description: Updates Admin status of the user
RequestBody:
    userId: MongoId of the user
Access: SuperAdmin
```

```yml
Route: /api/user/super-admin-status
Description: Updates Super Admin status of the user
RequestBody:
    userId: MongoId of the user
Access: SuperAdmin
```

##### DELETE Requests

```yml
Route: /api/user/favorites/:tutorialId
Description: Removes the tutorial from the favorites
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Private
```

```yml
Route: /api/user/tracks/:trackId
Description: Unsubscribes the user from the track
RequestParams:
    trackId: MongoId of the track
Access: Private
```

```yml
Route: /api/user/delete/:userId
Description: Deletes the user
RequestParams:
    userId: MongoId of the user
Access: SuperAdmin
```

[Go to API List ⬆](#list-of-apis)

### Tag API

##### GET Requests

```yml
Route: /api/tags
Description: Returns list of all tags
Access: Public
```

```yml
Route: /api/tags/unapproved
Description: Returns list of unapproved tags
Access: Admin
```

##### POST Requests

```yml
Route: /api/tags
Description: Submits a request to add a tag
RequestBody:
    name: Name of the tag
Access: Private
```

##### PUT Requests

```yml
Route: /api/tags/update
Description: Updates the name of the tag
RequestBody:
    tagId: MongoId of the tag
    name: Name of the tag
Access: Admin
```

##### PATCH Requests

```yml
Route: /api/tags/approved-status
Description: Changes the approved status of the tag
RequestBody:
    tagId: MongoId of the tag
Access: Admin
```

##### DELETE Requests

```yml
Route: /api/tags/:tagId
Description: Deletes the tag
RequestParams:
    tagId: MongoId of the tag
Access: Admin
```

[Go to API List ⬆](#list-of-apis)

### Tutorial API

##### GET Requests

```yml
Route: /api/tutorials
Description: Returns the list of all tutorials
Access: Public
```

```yml
Route: /api/tutorials/tutorial/:tutorialId
Description: Returns the information of the given tutorial
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Public
```

```yml
Route: /api/tutorials/tag/:tagId
Description: Returns the list of tutorials with the given tag
RequestParams:
    tagId: MongoId of the tag
Access: Public
```

```yml
Route: /api/tutorials/unapproved
Description: Returns the list upapproved tutorials
Access: Admin
```

##### POST Requests

```yml
Route: /api/tutorials
Description: Submits a request to add a tutorial
RequestBody:
    title: Title of the tutorial
    link: Link to original tutorial
    tags: Array of MongoId of tags
    educator: Name of the educator
    medium: Video or Blog
    typeOfTutorial: Free or Paid
    skillLevel: Beginner, Intermediate or Advanced
Access: Private
```

```yml
Route: /api/tutorials/upvote/:tutorialId
Description: Adds an upvote to the tutorial
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Private
```

##### PUT Requests

```yml
Route: /api/tutorials/update/:tutorialId
Description: Updates the tutorial info
RequestParams:
    tutorialId: MongoId of the tutorial
RequestBody:
    title: Title of the tutorial (Optional)
    link: Link to original tutorial (Optional)
    tags: Array of MongoId of tags (Optional)
    educator: Name of the educator (Optional)
    medium: Video or Blog (Optional)
    typeOfTutorial: Free or Paid (Optional)
    skillLevel: Beginner, Intermediate or Advanced (Optional)
Access: Admin
```

##### PATCH Requests

```yml
Route: /api/tutorials/approved-status
Description: Changes approved status of the tutorial
RequestBody:
    tutorialId: MongoId of the tutorial
Access: Admin
```

##### DELETE Requests

```yml
Route: /api/tutorials/tutorial/:tutorialId
Description: Deletes the tutorial
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Admin
```

```yml
Route: /api/tutorials/upvote/:tutorialId
Description: Removes a upvote from the tutorial
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Private
```

```yml
Route: /api/tutorials/cancel/:tutorialId
Description: Cancels the request to submit the tutorial
RequestParams:
    tutorialId: MongoId of the tutorial
Access: Private
```

[Go to API List ⬆](#list-of-apis)

### Track API

##### GET Requests

```yml
Route: /api/tracks
Description: Returns the list of all tracks
Access: Public
```

```yml
Route: /api/tracks/track/:trackId
Description: Returns the information of the given track
RequestParams:
    trackId: MongoId of the track
Access: Public
```

```yml
Route: /api/tracks/unapproved
Description: Returns the list of unapproved tracks
Access: Admin
```

##### POST Requests

```yml
Route: /api/tracks
Description: Submits a request to add a new track
RequestBody:
    name: Name of the track
    description: Short description about the track
    tutorials: Array of MongoId of tutorials
Access: Private
```

##### PUT Requests

```yml
Route: /api/tracks/update/:trackId
Description: Updates the track
RequestParams:
    trackId: MongoId of the track
RequestBody:
    name: Name of the track (Optional)
    description: Short description about the track (Optional)
    tutorials: Array of MongoId of tutorials (Optional)
Access: Admin
```

##### PATCH Requests

```yml
Route: /api/tracks/approved-status
Description: Changes the approved status of the track
RequestBody:
    trackId: MongoId of the track
Access: Admin
```

##### DELETE Requests

```yml
Route: /api/tracks/track/:trackId
Description: Deletes the track
RequestParams:
    trackId: MongoId of the track
Access: Admin
```

```yml
Route: /api/tracks/cancel/:trackId
Description: Deletes request to submit the track
RequestParams:
    trackId: MongoId of the track
Access: Private
```

[Go to API List ⬆](#list-of-apis)

### Feedback API

##### GET Requests

```yml
Route: /api/feedbacks
Description: Returns the list of all feedbacks
Access: SuperAdmin
```

```yml
Route: /api/feedbacks/:feedbackId
Description: Returns the given feedback
RequestParams:
    feedbackId: MongoId of the feedback
Access: SuperAdmin
```

##### POST Requests

```yml
Route: /api/feedbacks
Description: Submits a feedback
RequestBody:
    title: Title of the feedback
    message: Feedback message
Access: Private
```

##### PATCH Requests

```yml
Route: /api/feedbacks/read
Description: Marks all feedbacks as read
Access: SuperAdmin
```

```yml
Route: /api/feedbacks/read/:feedbackId
Description: Marks the given feedback as read
RequestParams:
    feedbackId: MongoId of the feedback
Access: SuperAdmin
```

```yml
Route: /api/feedbacks/unread/:feedbackId
Description: Marks the given feedback as unread
RequestParams:
    feedbackId: MongoId of the feedback
Access: SuperAdmin
```

```yml
Route: /api/feedbacks/:feedbackId
Description: Deletes the feedback
RequestParams:
    feedbackId: MongoId of the feedback
Access: SuperAdmin
```

[Go to API List ⬆](#list-of-apis)
