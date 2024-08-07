const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const express = require("express");
const app = express();
const port = 3000;

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get("/no-child", (req, res) => {
  const num = parseInt(req.query.num, 10);
  const result = fibonacci(num);
  res.send(`Result: ${result}`);
});

if (isMainThread) {
  app.get("/fibonacci", (req, res) => {
    const num = parseInt(req.query.num, 10);

    const worker = new Worker(__filename, { workerData: num });

    worker.on("message", (result) => {
      res.send(`Result: ${result}`);
    });

    worker.on("error", (error) => {
      console.error(`Worker error: ${error}`);
      res.status(500).send(error.message);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
} else {
  const num = workerData;
  const result = fibonacci(num);
  parentPort.postMessage(result);
}
