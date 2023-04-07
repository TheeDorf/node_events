// Complete Events Exercise
const { createServer } = require("http");
const { appendFile, readFile, createReadStream, read } = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const PORT = 5001;

const newsletter = new EventEmitter();

const server = createServer((req, res) => {
  const { url, method } = req;

  req.on("error", (err) => {
    console.error(err);
    res.statusCode = 404;
    res.setHeader("content-Type", "application/json");
    res.write(JSON.stringify({ msg: "invalid request 404!" }));
    res.end();
  });

  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk)
    console.log(chunks);
  })
  req.on("end", ()=>{
    if (url === "/newsletter_signup" && method === "POST"){
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const signUp = `${body.contact}, ${body.newsletter}\n`;
    newsletter.emit("new signup!", signUp, res);
    res.setHeader("content-Type", "application/json");
    res.write(
        JSON.stringify({ msg: "Successfully signed up" })
    );
    res.end();
  }
  else if (url === "/newsletter_signup" && method === "GET"){
    res.setHeader("content-type", "text/html");
    const readStream = createReadStream(
        path.join(__dirname, "./public/index.html")
    )
    readStream.pipe(res);
  }
  else{
    res.statusCode= 400;
    res.setHeader("content-Type", "application/json");
    res.write(JSON.stringify({ msg: "not a valid endpoint" }));
    res.end();
  }
  })
});
server.listen(PORT, ()=> console.log(`server listening at ${PORT} port`))

newsletter.on("new signup!", (signUp, res)=>{
    appendFile(
        path.join(__dirname, "./assets/newsList.csv"),
        signUp,
        (err)=>{
            if (err){
                newsletter.emit('error', err, res);
                return;
            }
            console.log("the file was updated");
        }
    )
})

newsletter.on("error", (err,res)=>{
    console.log(err);
    res.statusCode = 500;
    res.setHeader("content-Type", "application/json");
    res.write(JSON.stringify({msg: "there was an error "}))
    res.end();
})