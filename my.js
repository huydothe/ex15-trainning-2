const http = require('http');
const url = require('url');
const qs = require('qs');
const fs = require('fs');
const port = 8080;

let handlers = {};

handlers.login = function (req, res) {
    fs.readFile('./views/login.html', "utf8", (err, data) => {
        if (err) throw err;
        res.writeHead(200, {'Content-type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

handlers.home = function (req, res) {
    let data = '';
    req.on('data', chunk => {
        data+=chunk;
    });
    req.on('end',()=>{
        data = qs.parse(data);
        let timeout = Date.now() + 1000*60*60;
        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+timeout+"}";
        createTokenSession(tokenSession);
        fs.readFile('./views/home.html', 'utf8', function (err, datahtml) {
            if (err) {
                console.log(err);
            }
            datahtml = datahtml.replace('{name}', data.name);
            datahtml = datahtml.replace('{email}', data.email);
            datahtml = datahtml.replace('{password}', data.password);
            console.log(data)
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(datahtml);
            return res.end();
        });
    })
    req.on('error',()=>{
        console.log('error');
    })
};

handlers.notfound = function (req, res) {
    fs.readFile('./views/notfound.html', "utf8", (err, data) => {
        if (err) throw err;
        res.writeHead(200, {'Content-type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

let router = {
    'login': handlers.login,
    'home': handlers.home,
    'notfound': handlers.notfound
}

let createRandomString = function (strLength) {
    strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        let possibleChar = 'abcdefghiklmnopqwerszx1234567890';
        let str = '';
        for (let i = 0; i < strLength; i++) {
            let randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            str += randomChar;
        }
        return str;
    }
}

let createTokenSession = function (data) {
    let tokenID = createRandomString(20);
    let fileName = './token/' + tokenID;
    fs.writeFile(fileName, data, err => {
        if (err) throw err;
    });
}

const server=http.createServer((req, res)=>{
    let urlParse = url.parse(req.url);
    console.log(urlParse);
    let path = urlParse.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');
    let chosenHandlers = (typeof (router[trimPath]) !== 'undefined')?router[trimPath]:router.notfound;
    chosenHandlers(req,res);
});

server.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`)
})