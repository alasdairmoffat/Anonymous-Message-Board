/* global setTitle createThread fetchFromAPI */

window.addEventListener('load', async () => {
  const pathName = window.location.pathname;
  const [board, threadId] = pathName.split('/').slice(2);

  setTitle(`/b/${board}/`);

  const thread = await fetchFromAPI(
    `/api/replies/${board}?thread_id=${threadId}`,
  );

  document
    .querySelector('#thread-body')
    .append(createThread(board, thread, false));
});
