const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require('bcrypt');
const csurf = require('csurf')
const contentRouter = require('./routers/content-Router')
const feedbackRouter = require('./routers/feedback-Router')
const commentsRouter = require('./routers/comments-Router')
const cookieParser = require('cookie-parser')
const db = require('./db') 



const app = express()
app.use(cookieParser())
csurf({ cookie: true })
app.use(expressSession({
    secret:"aboubedi",
    saveUninitialized:false,
    resave: false,
    store: new SQLiteStore({
      database: "sessions.db"
    })
}))


var http = require('http')
var fs  = require('fs')

app.engine(".hbs", expressHandlebars({
	defaultLayout: "main.hbs",
	extname: "hbs"
}))

app.use(bodyParser.urlencoded({
	extended: false
}))

app.use(express.static('static'))
app.use(express.static('views/images'))
app.use(csurf())

app.use(function(request, response, next){
	response.locals.isLoggedIn = request.session.isLoggedIn
	next()
})



app.use(function (request, response, next) {
  response.locals.csrfTokenFunc = request.csrfToken
  next()
})

app.use(function (error, request, response, next) {
  if (error.code !== 'EBADCSRFTOKEN') return next(error)
 
  // handle CSRF token errors here
  response.status(403)
  //res.send(bad csurf token)
  const errors="Something went wrong."
  const model={
    partialIsActive: true,
    errors
  }
  response.render('Home.hbs',model)  

})

app.use('/',contentRouter)
app.use('/',feedbackRouter)
app.use('/',commentsRouter)





app.get("/", function(request, response)  {
  
   db.getAllBlogPost(function(error, blogPost){
     if(error){
      const homeError="could not load lyvlyBlog, please come back later"
      const model={
        homeError,
        partialIsActive: true
      }
     response.render('Home.hbs',model) 
 
   }else{
     const model ={
      pagecontent: blogPost,
      partialIsActive: false
     }
     response.render('Home.hbs',model) 
    }
   })
 })


app.get('/about', (req, res) => {
    res.render('about.hbs')
  })

app.get('/contact',function(request, response){
  response.render('contact.hbs')
})

  
app.get('/login', (req, res) => {
  if(req.session.isLoggedIn){
    res.redirect('/')
    return
  }
  model={
    hideFooter: true
  }
  res.render('login.hbs',model)
  return
    
}) 

const ADMIN_USERNAME = "abah19vo"


app.post("/login", function(request, response){
  
  const insertedUsername = request.body.username
  const insertedPassword = request.body.password


  db.getPassword(ADMIN_USERNAME, function(error,hash){
    if(error){
      error="Something went wrong, please try again later"
      const model={
        error,
        hideFooter: true
      }
      response.render('login.hbs',model)     
      return
    }else{
      bcrypt.compare(insertedPassword, hash.password, function(err, result) {
        if(err){
          error="Some thing went wrong, please try again later"
          const model={
            error,
            hideFooter: true
          }
          response.render('login.hbs',model)     
        }else{
          if(result && insertedUsername == ADMIN_USERNAME ){
            request.session.isLoggedIn = true
            response.redirect("/")
          }else{
            error="Wrong Username or Password"
            const model={
              hideFooter: true,
              error
            }
            response.render('login.hbs',model)
            return
          }
        }
      })
    }
  })  
})  


app.post("/logout", function(request, response){
  request.session.isLoggedIn = false
  response.redirect("/")
})

const port= 8080

app.listen(port)