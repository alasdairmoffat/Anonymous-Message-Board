# Anonymous Message Board

> FreeCodeCamp Anonymous Message Board challenge.

[![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://badges.mit-license.org)
[![Build Status](https://travis-ci.com/alasdairmoffat/Anonymous-Message-Board.svg?branch=master)](https://travis-ci.com/alasdairmoffat/Anonymous-Message-Board)
[![codecov](https://codecov.io/gh/alasdairmoffat/Anonymous-Message-Board/branch/master/graph/badge.svg)](https://codecov.io/gh/alasdairmoffat/Anonymous-Message-Board)

![Demo Image](../assets/demo-image.png?raw=true)

## Table of Contents

- [Preview](#preview)
- [General Info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [License](#license)

## Preview

[Glitch](https://alasdairmoffat-anonymous-message-board.glitch.me)

## General Info

Project built to fulfill the following User Stories:

1. Only allow your site to be loading in an iFrame on your own pages.
2. Do not allow DNS prefetching.
3. Only allow your site to send the referrer for your own pages.
4. I can **POST** a thread to a specific message board by passing form data `text` and `delete_password` to _/api/threads/{board}_.(Recomend res.redirect to board page /b/{board})
   Saved will be `_id`, `text`, `created_on`(date&time), `bumped_on`(date&time, starts same as created_on), `reported`(boolean), `delete_password`, & `replies`(array).
5. I can **POST** a reply to a thead on a specific board by passing form data `text`, `delete_password`, & `thread_id` to _/api/replies/{board}_ and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id})
   In the thread's 'replies' array will be saved `_id`, `text`, `created_on`, `delete_password`, & `reported`.
6. I can **GET** an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from _/api/threads/{board}_. The `reported` and `delete_passwords` fields will not be sent.
7. I can **GET** an entire thread with all it's replies from _/api/replies/{board}?thread_id={thread_id}_. Also hiding the same fields.
8. I can delete a thread completely if I send a **DELETE** request to _/api/threads/{board}_ and pass along the `thread_id` & `delete_password`. (Text response will be 'incorrect password' or 'success')
9. I can delete a post(just changing the text to '[deleted]') if I send a **DELETE** request to _/api/replies/{board}_ and pass along the `thread_id`, `reply_id`, & `delete_password`. (Text response will be 'incorrect password' or 'success')
10. I can report a thread and change it's reported value to true by sending a **PUT** request to _/api/threads/{board}_ and pass along the `thread_id`. (Text response will be 'success')
11. I can report a reply and change it's reported value to true by sending a **PUT** request to _/api/replies/{board}_ and pass along the `thread_id` & `reply_id`. (Text response will be 'success')
12. Complete functional tests that wholely test routes and pass.

### Example usage

|          API           |            GET             |          POST          |          PUT           |                DELETE                 |
| :--------------------: | :------------------------: | :--------------------: | :--------------------: | :-----------------------------------: |
| `/api/threads/{board}` |    list recent threads     |     create thread      |     report thread      |      delete thread with password      |
| `/api/replies/{board}` | show all replies on thread | create reply on thread | report reply on thread | change reply to '[deleted]' on thread |

### Example returns

**GET** `/api/threads/general`

```json
[
  {
    "_id": "5d63b153de1f1000f8de14ab",
    "text": "Other thread",
    "created_on": "2019-08-26T10:15:47.303Z",
    "bumped_on": "2019-08-26T10:15:47.303Z",
    "replies": []
  },
  {
    "_id": "5d63b0a0de1f1000f8de14a6",
    "text": "Thread text",
    "created_on": "2019-08-26T10:12:48.800Z",
    "bumped_on": "2019-08-26T10:14:43.572Z",
    "replies": [
      {
        "created_on": "2019-08-26T10:14:24.939Z",
        "_id": "5d63b100de1f1000f8de14a7",
        "text": "Thread reply"
      },
      {
        "created_on": "2019-08-26T10:14:43.572Z",
        "_id": "5d63b113de1f1000f8de14a9",
        "text": "Other reply"
      }
    ]
  }
]
```

**GET** `/api/replies/general?thread_id=5d63b0a0de1f1000f8de14a6`

```json
{
  "_id": "5d63b0a0de1f1000f8de14a6",
  "text": "Thread text",
  "created_on": "2019-08-26T10:12:48.800Z",
  "bumped_on": "2019-08-26T10:14:43.572Z",
  "replies": [
    {
      "created_on": "2019-08-26T10:14:24.939Z",
      "_id": "5d63b100de1f1000f8de14a7",
      "text": "Thread reply"
    },
    {
      "created_on": "2019-08-26T10:14:43.572Z",
      "_id": "5d63b113de1f1000f8de14a9",
      "text": "Other reply"
    }
  ]
}
```

## Technologies

- Node.js version: 10.15
- Express version: 4.14
- Chai version: 3.5
- Mocha version: 6.2
- Helmet version: 3.1
- MongoDB version: 2.2
- Mongoose version: 5.5
- Bcrypt version: 3.0

## Setup

### Clone

Clone from repository

```bash
git clone https://github.com/alasdairmoffat/Anonymous-Message-Board.git
```

### Installation

```bash
cd Anonymous-Message-Board
npm install
npm start
```

## License

> **[MIT license](https://opensource.org/licenses/mit-license.php)**
