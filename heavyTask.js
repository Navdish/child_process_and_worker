function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const num = parseInt(process.argv[2], 10);
const result = fibonacci(num); 

// if (process.send) {
//     process.send(result);
// } else {
//     console.error("Process.send is not available.");
// }