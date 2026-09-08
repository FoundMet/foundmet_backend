import app from './app.js';

const PORT=process.env.PORT;

if(!PORT){
    console.log(`Port Missing On ${PORT} .env File`);
}

app.listen(PORT,()=>{
    console.log(`Server Run On Port ${PORT}`);
})
