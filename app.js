
///////////dependecies///////////////
const mongoose = require("mongoose");
const Easy = require("./db/easy");
const Medium = require("./db/medium");
const Hard = require("./db/hard");
const MyModel = require("./db/account");
const express = require("express");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const env = require('./env');
const cookieParser = require('cookie-parser');
const auth = require('./auth');
const path = require('path');
const bodyparser = require('body-parser');
const argon2 = require('argon2');

//const MyModel = mongoose.model("MyModel",MyModel_one);

//////////////////////////////////////
mongoose.set("strictQuery",false);
mongoose.connect(env.database.host, { useNewUrlParser: true, useUnifiedTopology: true });
///////////////////////////////////////////////////////

const app = express();

app.use('/public', express.static((__dirname, 'public'), {
  maxAge: 60 * 60 * 24 * 365, // cache for 1 year
}));


app.set('view engine', 'ejs');

app.use(bodyparser.json());
app.use(express.json())
app.use(cookieParser());



app.get('/', (req, res) => {
  try {
    res.sendFile('welcome.html', { root: path.join(__dirname, '/public') })
  

  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(500).send('Internal Server Error');
  

  }
});



app.post('/', async (req, res) => {
  try {

    
    const name = req.body.teamNo;
    const password = req.body.password;
  
 

  
    const user = await MyModel.findOne({ name: name });
  ;
   

    const static_string = env.stat.static_string;
    
    

    if (!user) {
      return res.status(401).send('Incorrect name');
    }
    
    if (!await argon2.verify(user.password, password + static_string)) {
      return res.status(401).send('Incorrect password');
    }
    
    if (user.isOnline) {
      return res.status(401).json({ message: 'User is already logged in' });
    }
    

 
  
    const payload = { userId: user._id };
    const token = jwt.sign(payload, env.jwt.secret);
    
    user.isOnline = true;
    await user.save()

    res.cookie('token', token, { httpOnly: true });
    
    res.redirect('/dashboard')
    
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/dashboard', auth, async(req, res) => {
 try
  {
    res.sendFile('index.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });
  }
  catch (error) {
    console.error('Error rendering dashboard page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getdata', auth, async(req, res) => {
 
  const token = req.cookies.token;
  //console.log(token)
  const decodedToken = jwt.verify(token, env.jwt.secret);
  const userId = decodedToken.userId;
  const user = await MyModel.findById(userId);

  let question1, question2, question3;

  let count = 0;

  for (let i = 0; i < user.arr.length; i++) {
    if (count !== 3) {
      if (user.arr[i] !== null) {
        let temp = user.arr[i];
        //console.log(temp)

        let ques = "";

        let ques_easy = await Easy.findOne({ code: temp });
        let ques_med = await Medium.findOne({ code: temp });
        let ques_har = await Hard.findOne({ code: temp });


        if (ques_easy != null) {
          ques = ques_easy.question;
        }

        if (ques_med != null) {
          ques = ques_med.question;
        }
        if (ques_har != null) {
          ques = ques_har.question;
        }

        //console.log(ques)

        if (count === 0) {
          question1 = ques;
        } else if (count === 1) {
          question2 = ques;
        } else if (count === 2) {
          question3 = ques;
        }

        count = count + 1;
      }
    } else {
      break;
    }
  }
  const allData = await MyModel.find().sort({ point: -1 }).select('name point');

  data = { question1, question2, question3, allData };



  if (question1 !== undefined || question2 !== undefined || question3 !== undefined) {
    
    if(question1 == undefined)
    {
      question1 = "You are very close to the finish line";
    }
    if(question2 == undefined)
    {
      question2 = "You are very close to the finish line";
    }
    if(question3 == undefined)
    {
      question3 = "You are very close to the finish line";
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(data);
  }
  else
  {
    res.redirect('/logout') //game finished
  }
})


app.post('/dashboard', (req, res) => {
  try {
    res.redirect('/dashboard/code');

  }
  catch {
    console.error('Error redirecing the page', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/dashboard/code', (req, res) => {
  try {
    res.sendFile('hexa.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });
  }
  catch
  {
    console.error('Error rendering code page:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).sendFile('thanks.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });
    }
    const decoded = jwt.verify(token, env.jwt.secret);
    const userId = decoded.userId;

    const user = await MyModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user, please login' });
    }

    user.isOnline = false;
    await user.save();

    res.clearCookie('token');
    res.sendFile('thanks.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/dashboard/codes/success', (req, res) => {
  try {
    res.sendFile('sucess.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });// show the success page
  }
  catch
  {
    console.error('Error rendering success page:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/dashboard/codes/error', (req, res) => {
  try {
    res.sendFile('error.html', { root: __dirname + '/public', headers: { 'Content-Type': 'text/html' } });
  }
  catch
  {
    console.error('Error rendering error page:', error);
    res.status(500).send('Internal Server Error');
  }
})



app.post('/dashboard/codes', auth, async (req, res) => {

  try {

    const search = req.body.search;
    const token = req.cookies.token;
    let temp = 0;
    const ques_easy = await Easy.findOne({ code: search });
    const ques_med = await Medium.findOne({ code: search });
    const ques_hard = await Hard.findOne({ code: search });
    //console.log(question) 

    if (ques_easy != null) {
      temp = ques_easy.score;
    }

    if (ques_med != null) {
      temp = ques_med.score;
    }
    if (ques_hard != null) {
      temp = ques_hard.score;
    }

    const decodedToken = jwt.verify(token, env.jwt.secret);
    const userId = decodedToken.userId;
    const updatedUser = await MyModel.findById(userId);

    if (!updatedUser) throw new Error('User not found');

    for (var i = 0; i < updatedUser.arr.length; i++) {

      if (updatedUser.arr[i] === search) {

        //const detail = await MyModel.find({arr:search})

        //console.log(detail)

        await updatedUser.updateOne({
          $inc: {
            point: temp,
          }
        });

        let newArr = [...updatedUser.arr];
        newArr.splice(i, 1, null);
        updatedUser.arr = newArr;


        await updatedUser.save();

        // Replace the found code in the `arr` field with `null`


        res.redirect('/dashboard/codes/success')

      }
    }

    //return res.send("The score is not updated");
  } catch (err) {
    console.error(err)
    return res.status(500).send(err.message);
  }
});

app.listen(env.server.port, () => console.log('Server listening on port 3000'))

