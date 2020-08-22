/* global setTitle createThread fetchFromAPI */

window.addEventListener('load', async () => {
  const pathName = window.location.pathname;
  const board = pathName.split('/')[2];

  setTitle(`/b/${board}/`);

  const boardData = await fetchFromAPI(`/api/threads/${board}`);

  const boardBody = document.querySelector('#board-body');

  boardData.forEach((thread) => {
    boardBody.append(createThread(board, thread, true));
  });
});
