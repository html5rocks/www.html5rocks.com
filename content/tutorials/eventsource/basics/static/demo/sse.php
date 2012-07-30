<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

/**
 * Constructs the SSE data format and flushes that data to the client.
 *
 * @param string $id Timestamp/id of this connection.
 * @param string $msg Line of text that should be transmitted.
 */
function sendMsg($id , $msg) {
  echo "id: $id" . PHP_EOL;
  echo "data: {\n";
  echo "data: \"msg\": \"$msg\", \n";
  echo "data: \"id\": $id\n";
  echo "data: }\n";
  echo PHP_EOL;
  ob_flush();
  flush();
}

$startedAt = time();

do {
  // Cap connections at 10 seconds. The browser will reopen the connection on close
  if ((time() - $startedAt) > 10) {
    die();
  }

  sendMsg($startedAt , time());
  sleep(5);

  // If we didn't use a while loop, the browser would essentially do polling
  // every ~3seconds. Using the while, we keep the connection open and only make
  // one request.
} while(true);
?>