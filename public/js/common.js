/* eslint-disable no-unused-vars */

const MESSAGE_DURATION = 2000;

function formatTime(timeString) {
  const time = Math.floor((Date.now() - new Date(timeString)) / 1000);

  if (Math.floor(time / (60 * 60 * 24 * 7))) {
    const weeks = Math.floor(time / (60 * 60 * 24 * 7));
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (Math.floor(time / (60 * 60 * 24))) {
    const days = Math.floor(time / (60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (Math.floor(time / (60 * 60))) {
    const hours = Math.floor(time / (60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (Math.floor(time / 60)) {
    const mins = Math.floor(time / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  return '<1 min ago';
}

function setTitle(title) {
  // Set page title to be name of board
  document.title = title;

  document.querySelector('#title').textContent = title;
}

async function fetchFromAPI(url) {
  try {
    const res = await fetch(url);
    const data = res.json();

    return data;
  } catch (error) {
    console.log(error);
    return { err: error.message };
  }
}

function createDomElement(elementString) {
  return new DOMParser().parseFromString(elementString, 'text/html').body
    .firstChild;
}

function displayMessage(element, message) {
  const capitalisedMessage = message[0].toUpperCase() + message.slice(1);
  element.textContent = capitalisedMessage;

  setTimeout(() => {
    element.textContent = '';
  }, MESSAGE_DURATION);
}

function createReplyOptions(board, thread_id, reply_id) {
  // Create DOM Elements
  const optionsContainer = createDomElement('<div class="options"></div>');
  const reportButton = createDomElement('<button class="btn">Report</button>');
  const deleteButton = createDomElement('<button class="btn">Delete</button>');

  const deleteFormContainer = createDomElement(
    '<div class="delete-form"></div>',
  );

  const deleteForm = createDomElement(
    `<form class="hidden">
        <input name="password" type="password" placeholder="deletion password" class="delete-password">
        <button type=submit class="btn">Submit</button>
      </form>`,
  );

  const responseMessage = createDomElement('<div class="response"></div>');

  // Add functionality to elements
  reportButton.addEventListener('click', async () => {
    const body = JSON.stringify({
      thread_id,
      reply_id,
    });

    const res = await fetch(`/api/replies/${board}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });
    const data = await res.text();

    displayMessage(responseMessage, data);
  });

  deleteButton.addEventListener('click', () => {
    if (deleteForm.classList.contains('hidden')) {
      deleteForm.classList.remove('hidden');
      deleteForm.querySelector('input').focus();
    } else {
      deleteForm.classList.add('hidden');
    }
  });

  deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = JSON.stringify({
      delete_password: e.target.password.value,
      thread_id,
      reply_id,
    });

    const res = await fetch(`/api/replies/${board}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });
    const data = await res.text();

    displayMessage(responseMessage, data);

    if (data === 'success') {
      setTimeout(
        window.location.reload.bind(window.location),
        MESSAGE_DURATION,
      );
    }
  });

  // Bind DOM elements
  deleteFormContainer.append(deleteForm);

  optionsContainer.append(reportButton);
  optionsContainer.append(deleteButton);
  optionsContainer.append(deleteFormContainer);
  optionsContainer.append(responseMessage);

  return optionsContainer;
}

function createReplies(board, threadId, replies) {
  const repliesElem = createDomElement('<div class="thread-replies"></div>');

  replies.forEach((reply) => {
    const replyDiv = createDomElement('<div class="reply"></div>');
    replyDiv.append(
      createDomElement(
        `<div class="date">${formatTime(reply.created_on)}</div>`,
      ),
    );
    replyDiv.append(createDomElement(`<div class="text">${reply.text}</div>`));
    replyDiv.append(createReplyOptions(board, threadId, reply._id));

    repliesElem.append(replyDiv);
  });

  return repliesElem;
}

function createNewReply(board, thread_id) {
  const newReplyElement = createDomElement(`
    <div class="new-reply">
      <div class="response"></div>
    </div>`);

  const newReplyForm = createDomElement(`
    <form>
        <textarea type="text" name="text" rows="2" cols="80" placeholder="Add Reply..." required></textarea>
        <div class="controls">
          <input type="password" class="delete-password" name="delete_password" placeholder="deletion password"
            required>
          <button type="submit" class="btn">Submit</button>
        </div>
      </form>
    `);

  newReplyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = JSON.stringify({
      text: e.target.text.value,
      delete_password: e.target.delete_password.value,
      thread_id,
    });

    const res = await fetch(`/api/replies/${board}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });

    const data = await res.text();

    if (data === 'missing parameters') {
      displayMessage(newReplyElement.querySelector('.response'), data);
    } else {
      window.location.reload();
    }
  });

  newReplyElement.append(newReplyForm);

  return newReplyElement;
}

function createThread(board, thread, isBoard) {
  const {
    created_on, text, replies, _id,
  } = thread;

  const threadElement = createDomElement('<div class="thread"></div>');

  const threadText = createDomElement('<div class="thread-text"></div>');
  threadText.append(createDomElement(`<div class="text">${text}</div>`));
  threadText.append(
    createDomElement(`<div class="date">${formatTime(created_on)}</div>`),
  );
  threadElement.append(threadText);

  if (isBoard) {
    threadElement.append(
      createDomElement(
        `<a class="thread-link" href="/b/${board}/${_id}">View full thread</a>`,
      ),
    );
  }

  threadElement.append(createReplies(board, _id, replies));
  threadElement.append(createNewReply(board, _id));

  return threadElement;
}
