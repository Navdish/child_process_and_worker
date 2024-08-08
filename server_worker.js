// const {
//   Worker,
//   isMainThread,
//   parentPort,
//   workerData,
// } = require("worker_threads");
// const express = require("express");
// const app = express();
// const port = 3000;

// function fibonacci(n) {
//   if (n <= 1) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// }

// app.get("/no-child", (req, res) => {
//   const num = parseInt(req.query.num, 10);
//   const result = fibonacci(num);
//   res.send(`Result: ${result}`);
// });

// if (isMainThread) {
//   app.get("/fibonacci", (req, res) => {
//     const num = parseInt(req.query.num, 10);

//     const worker = new Worker(__filename, { workerData: num });

//     worker.on("message", (result) => {
//       res.send(`Result: ${result}`);
//     });

//     worker.on("error", (error) => {
//       console.error(`Worker error: ${error}`);
//       res.status(500).send(error.message);
//     });

//     worker.on("exit", (code) => {
//       if (code !== 0) {
//         console.error(`Worker stopped with exit code ${code}`);
//       }
//     });
//   });

//   app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
//   });
// } else {
//   const num = workerData;
//   const result = fibonacci(num);
//   parentPort.postMessage(result);
// }


//////////////////////////////////////////////////////////////////////////

const cluster = require('cluster');
const { Worker } = require('worker_threads');
const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const port = 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running, forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  app.get('/no-child', (req, res) => {
    const num = parseInt(req.query.num, 10);
    const result = fibonacci(num);
    console.log(`Worker ${cluster.worker.id} handling no-child request`);
    res.send(`Result: ${result} (Handled by Worker ${cluster.worker.id})`);
  });

  app.get('/fibonacci', (req, res) => {
    const num = parseInt(req.query.num, 10);
    console.log(`Worker ${cluster.worker.id} received request for fibonacci(${num})`);

    const worker = new Worker(path.join(__dirname, 'worker.js'), { workerData: num });

    worker.on('message', (result) => {
      res.send(`Result: ${result} (Handled by Worker ${cluster.worker.id})`);
    });

    worker.on('error', (error) => {
      console.error(`Worker thread error: ${error}`);
      res.status(500).send(error.message);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker thread stopped with exit code ${code}`);
      }
    });
  });

  app.listen(port, () => {
    console.log(`Worker ${cluster.worker.id} started and listening on port ${port}`);
  });

  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}
