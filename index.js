// index.js
const express = require('express');
const { spawn, fork, exec, execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/no-child', (req, res) => {
  const num = parseInt(req.query.num, 10); 
  const result = fibonacci(num);
  res.send(`Result: ${result}`);
});

app.get('/spawn', (req, res) => {
  const num = req.query.num; 
  const child = spawn('node', ['heavyTask.js', num]);
  let result = '';

  child.stdout.on('data', (data) => {
    console.log(data);
    result += data;
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    res.send(`Result: ${result}`);
  });
});

app.get('/exec', (req, res) => {
  const num = req.query.num; 
  exec(`node heavyTask.js ${num}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send(error.message);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    res.send(`Result: ${stdout}`);
  });
});

app.get('/execFile', (req, res) => {
  const num = req.query.num; 
  execFile('node', ['heavyTask.js', num], (error, stdout, stderr) => {
    if (error) {
      console.error(`execFile error: ${error}`);
      return res.status(500).send(error.message);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    res.send(`Result: ${stdout}`);
  });
});


app.get('/fork', (req, res) => {
  const num = req.query.num;
  const child = fork(path.join(__dirname, 'heavyTask.js'), [num]);

  child.on('message', (message) => {
    res.send(`Result: ${message}`);
  });

  child.on('error', (error) => {
    console.error(`error: ${error}`);
    res.status(500).send(error.message);
  });

  child.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
