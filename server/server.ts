import app from './src/app';

let port : String | Number = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})