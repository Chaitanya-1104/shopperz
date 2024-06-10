const express=require('express');
const app=express();


const cors= require('cors');

const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt=require('bcryptjs');
const jwt= require('jsonwebtoken');

const salt=bcrypt.genSaltSync(6);
const secret='breuihgughubvuuv23g';

const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs =  require('fs');
const Post=require('./models/Post');
app.use(cors({credentials:true,origin:'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


mongoose.connect('mongodb+srv://chaitanyanath114:mbtcCI8bgZxsOeJU@cluster0.9hv8f2x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');


app.post('/register', async (req,res) => {
    const { username, password} = req.body;
    console.log("Received username:", username);
    console.log("Received password:", password);
    try{    
    const userDoc = await User.create({ //mongoose function to crate upload 
            username,
            password: bcrypt.hashSync(password,salt),
        });
    
        res.json(userDoc);
    }
    catch(e){
        console.log(e);
        res.status(400).json(e);
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(400).json("User not found");
        }
        const passok = bcrypt.compareSync(password, userDoc.password);
        if (passok) {
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) {
                    console.error("Error signing JWT:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.cookie('token', token).json({
                    id:userDoc._id,
                    username,
                });
            });
        } else {
            res.status(400).json("Wrong credentials");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Profile endpoint
app.get('/profile', (req, res) => {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
        if (err) {
            console.error("Error verifying token:", err);
            return res.status(401).json({ error: "Unauthorized" });
           
        } else {
            res.json(decoded);
        }
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
})


app.post('/post', uploadMiddleware.single('file'), async(req,res) => {
    const {originalname,path}=req.file;
    const parts=originalname.split('.');
    const ext=parts[parts.length-1];
    const newPath =path+'.'+ext;
    fs.renameSync(path,newPath);


    const {token} =req.cookies;
    jwt.verify(token,secret,{}, async (err,info) => {
        if(err) throw err;
        const {title,summary,content}=req.body;
    const postDoc=await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author: info.id,
    });
        res.json(postDoc);
    });
});

app.get('/post', async (req,res) => {
    res.json(await Post.find()
    .populate('author',['username'])
    .sort({createdAt: -1})
    .limit(30)
    );
});

app.get('/post/:id', async(req,res) => {
    const {id} =req.params;
   const postDoc =await Post.findById(id).populate('author',['username']);
   res.json(postDoc);
    
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});