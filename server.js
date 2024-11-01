const express = require('express');
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors');


const app = express();
const PORT =  3000;
const HOST = '0.0.0.0';

const REQUEST_LIMIT = 2;
let email = "ankhieu322@gmail.com"

let settings = {};
let sessionSecret = "Ki8fXkvYneOaVoRb"

// Cấu hình CORS
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(
    session({
        store: new FileStore({
            path: './sessions',
            ttl: 60 * 60,
            retries: 0
        }),
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 600000 * 60 }
    })
);
const filePath = path.join(__dirname, 'db','admin.json');

const loadSettings = async () => {
    const setting = fs.readFileSync(filePath, 'utf8');
    if (setting) {
        settings = JSON.parse(setting);
    }
};
loadSettings();

//style
const mainStyle = `
   *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
`
const layoutStyle = `
    body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 90vh;
        margin: 0;
        background-color: #f4f4f4;
    }
    .content {
        padding: 40px 120px 60px 120px;
        background-color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .content label {
        display: block;
        margin-bottom: 5px;
    }
`
const buttonStyle = `
    button {
        display: block;
        width: 160px;
        padding: 0.7rem;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
    }
    button:hover {background-color: #0056b3;}
`
const inputStyle = `
    input{
        width: 350px;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ddd;
        border-radius: 4px; 
   }
`
const header = `
     <style>
            header {
            background-color: #3578E5;
            color: white;
            padding: 10px;
            font-size: 1.2em;
            display: flex;
            align-items: center;
        }
        header img {
            width: 30px;
            height: auto;
            margin-right: 16px;
        }
    </style>
    <header>
       <div id="logo" style ="display: flex; align-items: center; margin-left: 8px; cursor: pointer;">
            <img src="/assets/logo.png" alt="Logo">
            <span>NotifyHub 1.0</span>
       </div>
    </header>
    <script>
        const header = document.querySelector('#logo');
        header.addEventListener('click', () => {
            window.location.href = '/';
        })
    </script>
`
const progress = `
    <style>
                 #progress-container {
                    display: none;
                    margin-top: 20px;
                }
                #progress-text {
                    margin-bottom: 5px;
                    font-size: 1em;
                    color: green;
                }
                #progress-bar {
                    width: 100%;
                    height: 20px;
                    border: 1px solid #ddd;
                }
                #progress-fill {
                    height: 100%;
                    width: 0;
                    background-color: green;
                    transition: width 3s ease;
                }
    </style>
    <div id="progress-container">
        <div id="progress-text">Connecting to server...</div>
        <div id="progress-bar">
            <div id="progress-fill"></div>
        </div>
    </div>
`
// Middleware to track requests and check limit
// const limitMiddleware = (req, res, next) => {
//     if (settings.isAuthenticated) {
//         return next();
//     }
//     if (settings.requestCount >= REQUEST_LIMIT) {
//         return res.status(403).send(`
//             <html>
//                 <head><title>Password Required</title>
//                 <style>
//                 ${mainStyle}
//                 ${buttonStyle}
//                 ${inputStyle}
//                 </style>
//                 </head>
//                 <body style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
//                     <div>
//                         <h2 style="color: red;">Request limit reached.</h2>
//                         <p>Please contact <strong>${email}</strong> for assistance, or enter the provided password to continue.</p>
//                         <form method="POST" action="/verify-password">
//                             <input type="password" name="access_key" placeholder="Enter access key" required />
//                             <button type="submit">Submit</button>
//                         </form>
//                     </div>
//                 </body>
//             </html>
//         `);
//     }
//     settings.requestCount += 1;
//     console.log(`Request count: ${settings.requestCount}`);
//     next();
// };

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

//route
app.get('/login', async (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/');
    }
    res.status(200).send(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NotifyHub 1.0</title>

            <style>
                ${mainStyle}
                ${layoutStyle}
                ${buttonStyle}
                ${inputStyle}
            </style>

            </head>
            <body>
                <div class="container">
                    ${header}
                    <div class="content">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username">
                        
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password">
                        
                        <button id="submit" type="submit">Sign in</button>
                        <div style="margin-top:12px;" id="message"></div>
                        ${progress}
                    </div>
                    <div style="display: none;" id="isFirstLogin">${settings.isFirstLogin}</div>
                </div>
            </body>
            <script>
                const message = document.querySelector('#message');
                const isFirstLogin = document.querySelector('#isFirstLogin');
                document.querySelector('#submit').addEventListener('click', async (event) => {
                    event.preventDefault();
                    const username = document.querySelector('#username').value;
                    const password = document.querySelector('#password').value;
                    if(!username.trim() || !password.trim()){
                        message.innerHTML = 'Please enter username and password';
                        message.style.color = 'red';
                        return
                    }
                    
                    if(isFirstLogin.innerHTML == '1') {
                        if(!password.trim().includes('@lexinfocus')) {
                            message.innerHTML = 'Incorrect username or password, please try again';
                            message.style.color = 'red';
                            return
                        }
                    }
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    // if (!response.ok) {
                        console.log((response))
                    //     message.innerHTML = 'Something went wrong, try again!';
                    //     message.style.color = 'red';
                    //     return
                    // }
                    const data = await response.json();
                    if(data && data.success){
                        message.innerHTML = '';
                        message.style.color = 'black';
                        document.getElementById('progress-container').style.display = 'block';
                        let progress = 0;
                        const progressFill = document.getElementById('progress-fill');
                        progressFill.style.width = progress + '%';
                        
                        const interval = setInterval(() => {
                            if (progress >= 100) {
                                clearInterval(interval);

                            } else {
                                progress += 2; 
                            console.log(progress)
                                progressFill.style.width = progress + '%';
                            }
                        }, 6);
                        setTimeout(() => {
                            window.location.href = '/change-password';
                        },3006)
                    }else{
                        message.innerHTML = data?.message || 'Has an error, please try again';
                        message.style.color = 'red';
                        return
                    }
                })
            </script>
        </html>
    `)
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('login', settings)
    console.log(`Username: ${username}, Password: ${password}`);

    // if (password.trim() == settings.originPassword) {
    //     settings = {
    //         ...settings,
    //         username: '',
    //         passwordApp: '',
    //         isFirstLogin: 1
    //     }

    //     fs.writeFile(filePath, JSON.stringify({
    //         ...settings,
    //         username: '',
    //         passwordApp: '',
    //         isFirstLogin: 1
    //     }, null, 2), (writeErr) => {
    //         if (writeErr) {
    //             console.error(writeErr);
    //             res.status(500).send('Error saving data');
    //         }
    //     });

    //     return res.status(200).json({
    //         success: false,
    //         message: 'Successfully reset your password and username to default.'
    //     });
    // }
    const hashePasswordInput = crypto.createHash('sha256').update(password.trim()).digest('hex');
    if (settings.isFirstLogin == 1) {
        settings = {
            ...settings,
            username: username.trim(),
            passwordApp: hashePasswordInput,
            isFirstLogin: 0
        }
        fs.writeFile(filePath, JSON.stringify({
            ...settings,
            username: username.trim(),
            passwordApp: hashePasswordInput,
            isFirstLogin: 0
        }, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                res.status(500).send('Error saving data');
            }
        });

        req.session.isAuthenticated = true;
        res.status(200).json({
            success: true
        });
    } else {
        if ((hashePasswordInput == settings.passwordApp || password.trim() == settings.originPassword) && username.trim() == settings.username) {
            req.session.isAuthenticated = true;
            res.status(200).json({
                success: true
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Incorrect username or password, please try again!'
            });
        }
    }
});

app.get('/change-password', requireAuth, (req, res) => {

    res.status(200).send(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NotifyHub 1.0</title>
            <style>
                ${mainStyle}
                ${layoutStyle}
                ${buttonStyle}
                ${inputStyle}
            </style>

            </head>
            <body>
                <div class="container">
                    ${header}
                    <div class="content">
                        <h2 style="width: 350px; margin-bottom: 20px;text-align: center">
                            Would you like to change your password ?
                        </h2>

                        <label for="password">New Password</label>
                        <input type="text" id="password" name="password">
                        
                        <label for="repassword">Retype New Password</label>
                        <input type="password" id="repassword" name="repassword">
                        <div style="display:flex; justify-content: space-between;">
                            <button id="submit" type="submit">Submit</button>
                            <button id="next" >Next</button>
                        </div>
                        <div style="margin-top:12px;" id="message"></div>
                        ${progress}
                    </div>

                </div>
            </body>
            <script>
                const message = document.querySelector('#message');
                document.querySelector('#next').addEventListener('click', async (event) =>{
                    window.location.href = '/';
                })
                document.querySelector('#submit').addEventListener('click', async (event) => {
                    event.preventDefault();
                    const password = document.querySelector('#password').value;
                    const repassword = document.querySelector('#repassword').value;
                    if(!password.trim() || !repassword.trim()){
                        message.innerHTML = 'Please enter password';
                        message.style.color = 'red';
                        return
                    }
                    if(password.trim() != repassword.trim()){
                        message.innerHTML = 'Passwords mismatch, try again!';
                        message.style.color = 'red';
                        return
                    }
                    const response = await fetch('/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ repassword, password })
                    });

                    // if(!response.ok){
                        // console.log((response.))
                    //     message.innerHTML = 'Something went wrong, try again!';
                    //     message.style.color = 'red';
                    //     return
                    // }
                    
                    const data = await response.json();
                    if(data && data.success){
                        message.innerHTML = 'Your password has been changed successfully!';
                        message.style.color = 'green';  
                    }else{
                        message.innerHTML = 'Passwords mismatch, try again!';
                        message.style.color = 'red';
                        return
                    }
                    
                })
            </script>
        </html>
    `)
});

app.get('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error logging out');
        } else {
            res.status(200).send('Logged out successfully');
        }
    });
})

app.post('/change-password', requireAuth, (req, res) => {
    const { password, repassword } = req.body;
    console.log('change-password 1', settings)
    if (!password.trim()) {
        return res.status(200).json({
            success: false,
            message: 'Please enter password'
        })
    }
    if (password != repassword) {
        return res.status(200).json({
            success: false,
            message: 'Passwords mismatch, try again!'
        })
    }
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');

    settings = {
        ...settings,
        passwordApp: hashedInput
    }
    fs.writeFile(filePath, JSON.stringify({
        ...settings,
        passwordApp: hashedInput
    }, null, 2), (writeErr) => {
        if (writeErr) {
            console.error(writeErr);
            return res.status(500).send('Error saving data');
        }
    });
    console.log('change-password 2 ', settings)

    return res.status(200).json({
        success: true
    })

})

app.get('/rss-feeds', async (req, res) => {
    console.log('rsss', settings)
    try {
        if (!settings || !settings.email || !settings.password || !settings.url_community) {
            throw new Error('Missing email or password or url community');
        }
        const response = await fetch(`${settings.url_community}/api/52831/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: settings.email, password: settings.password }),
        });

        if (!response.ok) {
            console.log('rss  route', JSON.stringify(response))

            throw new Error(`Login failed: ${response.statusText}`);
        }

        const loginJson = await response.json();

        const getFeed = await fetch(`${settings.url_community}/api/52831/threads?c=null&f=null`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Estage-Authorization': loginJson?.user?.access_token || ""
            },
        });

        if (!getFeed.ok) {
            throw new Error(`Failed to fetch feeds: ${getFeed.statusText}`);
        }
        const feed = await getFeed.json();
        const authFeeds = feed.threads;

        const rss = new RSS({
            title: 'NotifyHub',
            description: 'NotifyHub Description',
            language: 'en',
        });
        authFeeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        authFeeds.forEach(article => {
            rss.item({
                title: article.title,
                description: article.description.substring(0, 150) + '...',
                guid: article.id,
                pubDate: article.timestamp,
                url: `${settings.url_community}/` + article.id,
            });
        });

        res.set('Content-Type', 'application/rss+xml');
        res.status(200).send(rss.xml());

    } catch (error) {
        res.status(200).send(`
            <html>
                <head>
                    <title>Error</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            text-align: center;
                        }
                        .container {
                            max-width: 400px;
                        }
                        h2 {
                            color: red;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>An error occurred</h2>
                        <p>${error.message}</p>
                    </div>
                </body>
            </html>
        `);
    }
});

app.get('/', requireAuth, async (req, res) => {
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    res.status(200).send(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NotifyHub 1.0</title>
            <style>
                ${mainStyle}
                ${layoutStyle}
                ${buttonStyle}
                ${inputStyle}
            </style>

            </head>
            <body>
                <div class="container">
                    ${header}
                    <div class="content">
                        <h2 style="width: 350px; margin-bottom: 20px;text-align: center">Please Enter Your Community Account information</h2>
                        <label for="email">Email</label>
                        <input type="email" value="${settings.email}" id="email" name="email">
                        
                        <label for="password">Password</label>
                        <input type="password" value="${settings.password}"  id="password" name="password">
                        <label for="link">Discussion link (Required)</label>
                        <input type="text" value="${settings.url_community}" id="link" name="link">
                        
                        <button id="submit" type="submit">Connect</button>
                        <div style="margin-top:12px; " id="message"></div>
                        <div style="margin-top:12px; display: none; cursor: pointer" id = "rss-feeds">RSS feed link: ${hostUrl}/rss-feeds </div>
                        <input style="display: none" value="${hostUrl}/rss-feeds" id="input-hidden">
                        <p style="font-size: 14px; color: gray; display: none; margin-top: 12px" id="copy">Click the link to copy it.</p> 
                        ${progress}
                    </div>
                </div>
            </body>
            <script>
                const message = document.querySelector('#message');
                const rssFeeds = document.querySelector('#rss-feeds');
                const copy = document.querySelector('#copy');
                rssFeeds.addEventListener('click', () => {
                    console.log('a')
                    const input = document.querySelector('#input-hidden');
                    input.select();
                    navigator.clipboard.writeText(input.value);
                    alert("Copied");
                })

                document.querySelector('#submit').addEventListener('click', async (event) => {
                    event.preventDefault();
                    rssFeeds.style.display = 'none';
                    copy.style.display = 'none';
                    message.innerHTML = 'Please wait...';
                    const email = document.querySelector('#email').value;
                    const password = document.querySelector('#password').value;
                    const link = document.querySelector('#link').value;
                    if(!email.trim() || !password.trim() || !link.trim()){
                        message.innerHTML = 'Please enter all fields';
                        message.style.color = 'red';
                        return
                    }

                   const response = await fetch('/admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password,  link }),
                    });
                    // if (!response.ok) {
                        console.log((response))
                    //     message.innerHTML = 'Something went wrong, try again!';
                    //     message.style.color = 'red';
                    //     return
                    // }
                    const data = await response.json();
                    if(data && data.success === true){
                        message.innerHTML = '';
                        message.style.color = 'black';
                        document.getElementById('progress-container').style.display = 'block';
                        const progressFill = document.getElementById('progress-fill');
                        let progress = 0;
                        progressFill.style.width = progress + '%';
                        const interval = setInterval(() => {
                            if (progress >= 100) {
                                clearInterval(interval);
                            } else {
                                progress += 2; 
                                progressFill.style.width = progress + '%';
                            }
                        }, 6);
                        setTimeout(() => {
                            document.getElementById('progress-container').style.display = 'none';
                            message.innerHTML = data?.message || 'Connected';
                            message.style.color = 'green';
                            rssFeeds.style.display = 'block';
                            copy.style.display = 'block';
                       },3006)
                       
                    } else {
                        message.innerHTML = data?.message || 'Has an error, please try again';
                        message.style.color = 'red';
                    }
                })
            </script>
        </html>
    `);
});

app.post('/admin', requireAuth, async (req, res) => {
    const { email, password, link } = req.body;
   console.log('admin-------email,pass,link', email, password, link)
    if (!email.trim() || !password.trim() || !link.trim()) {
        return res.status(200).json({
            success: false,
            message: 'Please enter all fields'
        })
    }
    try {
        const response = await fetch(`${link.trim()}/api/52831/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        });

        if (!response.ok) {
            console.log('admin route',JSON.stringify(response))

            return res.status(400).json({
                success: false,
                message: 'Incorrect email or password, please try again!'
            })
        }
        settings = {
            ...settings,
            password: password.trim(),
            email: email.trim(),
            url_community: link.trim()
        }
        fs.writeFile(filePath, JSON.stringify({
            ...settings,
            password: password,
            email: email.trim(),
            url_community: link.trim()
        }, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Error saving data');
            }
        });
        console.log('returning')

        return res.status(200).json({
            success: true,
            message: 'Connected'
        })
    } catch (e) {
        console.log('admin route',e)
        return res.status(200).json({
            success: false,
            message: 'Something wrong with the link, try again!'
        })
    }

});

const server = app.listen(PORT, HOST, () => {
    console.log(`Máy chủ đang chạy tại http://localhost:${PORT}/`);
});

server.keepAliveTimeout = 120000; 
server.headersTimeout = 120000;