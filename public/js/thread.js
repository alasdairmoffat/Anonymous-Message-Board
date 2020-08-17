async function fetchPageData(board, threadId) {
  try {
    const res = await fetch(`/api/replies/${board}?thread_id=${threadId}`);
    const data = res.json();

    return data;
  } catch (error) {
    console.log(error);
    return { err: error.message };
  }
}

function setTitle(title) {
  // Set page title to be name of board
  document.title = title;

  document.querySelector('#title').textContent = title;
}

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

function createDomElement(elementString) {
  return new DOMParser().parseFromString(elementString, 'text/html').body
    .firstChild;
}

function createReplyOptions(board, thread_id, reply_id) {
  const optionsContainer = createDomElement('<div class="options"></div>');
  const reportButton = createDomElement('<button class="btn">Report</button>');
  const deleteButton = createDomElement('<button class="btn">Delete</button>');

  const deleteFormContainer = createDomElement(
    '<div class="delete-form"></div>',
  );

  const deleteForm = createDomElement(
    `<form class="hidden">
        <input name="password" type="password" placeholder="delete password" class="delete-password">
        <button type=submit class="btn">Submit</button>
      </form>`,
  );

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

    alert(data);
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

    alert(data);
  });

  deleteFormContainer.append(deleteForm);

  optionsContainer.append(reportButton);
  optionsContainer.append(deleteButton);
  optionsContainer.append(deleteFormContainer);

  return optionsContainer;
}

function displayReplies(board, threadId, replies) {
  const repliesElem = document.querySelector('#thread-replies');

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
}

function displayThread(board, threadId, thread) {
  document.querySelector('#thread-text').innerHTML = `<div class="text">
    ${thread.text}
  </div>
  <div class="date">
    (${formatTime(thread.created_on)})
  </div>`;

  const filteredReplies = thread.replies.filter(
    reply => reply.text !== '[deleted]',
  );

  displayReplies(board, threadId, filteredReplies);
}

function addNewReplyFunction(board, thread_id) {
  const newReply = document.querySelector('#new-reply');

  newReply.addEventListener('submit', async (e) => {
    const body = JSON.stringify({
      text: e.target.text.value,
      delete_password: e.target.delete_password.value,
      thread_id,
    });

    await fetch(`/api/replies/${board}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body,
    });
  });
}

window.addEventListener('load', async () => {
  const pathName = window.location.pathname;
  const [board, threadId] = pathName.split('/').slice(2);

  setTitle(`/b/${board}/`);

  const thread = await fetchPageData(board, threadId);

  console.log(thread);

  displayThread(board, threadId, thread);
  addNewReplyFunction(board, threadId);
});
