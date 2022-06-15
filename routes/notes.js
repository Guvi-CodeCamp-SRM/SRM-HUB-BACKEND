const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Blog = require('../models/Blog');
const { body, validationResult} = require('express-validator');

// ROUTE 1: Get all the notes using GET "/api/notes/fetchallnotes" Login required
router.get('/fetchuserblogs',fetchuser, async (req, res)=>{
    try {
        const blogs = await Blog.find({user: req.user.id});
        res.json(blogs)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.get('/fetchallblogs', async (req, res)=>{
    try {
        const blogs = await Blog.find({});
        res.json(blogs)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Add a New Note using POST "/api/notes/addnote" Login required
router.post('/addblog',[
    body('title', 'Enter a valid Title').isLength({min: 1}),
    body('description', 'Description must be 5 characters').isLength({min: 5}),
],fetchuser, async (req, res)=>{

    try {

    const{title, description, tag} = req.body;
    // if there are error return bad request and error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const blog = new Blog({
        title, description, tag, user: req.user.id
    })

    const saveBlog = await blog.save()

    res.json(saveBlog)

} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

// ROUTE 3: Update existing Note using PUT "/api/notes/updatenote" Login required
router.put('/updateblog/:id',fetchuser, async (req, res)=>{
    try {
    const {title, description, tag} = req.body;
    // create a new note object
    const newBlog = {};
    if (title) {newBlog.title = title};
    if (description) {newBlog.description = description};
    if (tag) {newBlog.tag = tag};

    // find the note to be updated and update it
    let note = await Blog.findById(req.params.id);
    if(!blog){return res.status(400).send("Not Found")}
    // Allow update only if user owns this note
    if (blog.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Blog.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({blog});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

// ROUTE 4: Delete existing Note using DELETE "/api/notes/deletenote" Login required
router.delete('/deleteblog/:id',fetchuser, async (req, res)=>{

try {
    // find the note to be delete and delete it
    let blog = await Blog.findById(req.params.id);
    if(!blog){return res.status(400).send("Not Found")}
    // Allow delete only if user owns this note
    if (blog.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    blog = await Blog.findByIdAndDelete(req.params.id)
    res.json({"Success": "Blog has been deleted", blog: blog});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

module.exports = router
