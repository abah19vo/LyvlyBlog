const express = require('express')
const db = require('../db')

const NAME_MIN_LENGTH=1;
const TITLE_MIN_LENGTH=10;
const POSITION_MIN_LENGTH=10;
const CONTENT_MIN_LENGTH=70;
const router = express.Router()

function getValidationErrors(name, title, content, position){
	const validationErrors = []
	if(name.length < NAME_MIN_LENGTH){
		validationErrors.push("The name must at least be "+NAME_MIN_LENGTH +" character.")
  }
  if(!isNaN(name)){
		validationErrors.push("The name can't be a number" )
  }
  if(title.length< TITLE_MIN_LENGTH ){
    validationErrors.push("The title must  at least  be "+TITLE_MIN_LENGTH+" characters. ")
  }
  if( !isNaN(title)){
    validationErrors.push("Title title can't be a number")
  }
  if(content.length<CONTENT_MIN_LENGTH ){
    validationErrors.push("The content must at least be "+CONTENT_MIN_LENGTH+" characters. ")
  }
  if(!isNaN(content)){
    validationErrors.push("The content can't be a number'")
  }
  if(position.length<POSITION_MIN_LENGTH ){
    validationErrors.push("Describe the place at least more then "+POSITION_MIN_LENGTH+" characters. ")
  }
  if(isNaN(position)==false){
    validationErrors.push("The location can't be a number")
  }
  
	return validationErrors
}

//post new content
router.post("/", function(request, response){
  const name = request.body.name
  const position = request.body.position
  const title = request.body.title
  const content = request.body.content
  const validationErrors = getValidationErrors(name, title, content,position)

  if(0 < validationErrors.length){
    db.getAllBlogPost(function(error, BlogPosts){
      if(error){
        const homeError="Could not load, please try again later"
        const model={
          homeError,
          partialIsActive: true
      }
      response.render('/',model) 
      return
      }else{ 
    
        const model ={
          validationErrors,
          name,
          position,
          title,
          content,
          pagecontent: BlogPosts,
          partialIsActive: false
        }
        response.render('Home.hbs',model) 
        
      }
      
    })

    return
  }
  

  db.createContent(name,position,title,content, function(error){
    if (error){
      const errors="could not upload to the server, please try again later"
      const model={
        partialIsActive: true,
        errors
      }
      response.render('/',model)     
      return
      
    }else{
      response.redirect('/')

    }
  })
})


// get update content page
  router.get("/update-content/:id", function(request, response){
    const id = request.params.id
    db.getUpdateContentById(id, function(error, BlogPost){
      if(error){
        const errors= "Could not display the pagecontent, please try again later "
        const model={
        errors,
        partialIsActive: true
        }
        response.render("Update-content.hbs", model)
        return
      }else{
        
        const model = {
          pagecontent: BlogPost,
          partialIsActive: false
        }
        response.render("Update-content.hbs", model)        
      }
      
    })

  })



//update the post with the specific id
router.post("/update-content/:id", function(request, response){

    const id = request.params.id
    const newname = request.body.name
    const newposition = request.body.position
    const newtitle = request.body.title
    const newcontent = request.body.content
    if(!request.session.isLoggedIn){
      errors.push("You need to be logged in to update the content")
      model={
        partialIsActive: true,
        errors
      }
      response.render("Update-content.hbs", model)
      return
    }
    const validationErrors = getValidationErrors(newname, newtitle, newcontent,newposition )


    if(0 < validationErrors.length){
        const model = {
          validationErrors,
          pagecontent:{
          name:newname,
          position: newposition,
          title: newtitle,
          content: newcontent
        }
      }
      response.render("Update-content.hbs", model)
      return
    }
    db.updateContentById(newname, newposition,newtitle,newcontent, id,function(error){  
      if(error){
        const errors="Could not upload to the server, please try again later "
        const model={
          errors,
          partialIsActive: true
        }
        response.render('Update-content.hbs',model)     
        return
      }else{
        const success ="The Uppdate is successfully excuted"

        model={
        success,
        partialIsActive: true
        }
        response.render('Home.hbs',model)
      }
    })



  })

  //delet a post with a specific id
  router.post("/delete-content/:id", function(request, response){
    const id = request.params.id
    if(!request.session.isLoggedIn){
      const errors="You need to be logged in to update the content"
      model={
        partialIsActive: true,
        errors
      }
      response.render("Home.hbs", model)
      return
    } 

    db.deleteContentById(id, function(error){
      if(error){
        const errors="Could not delete this post, please try again later."
        const model={
          partialIsActive: true,
          errors
        }
        response.render('Home.hbs',model)       
      }else{
        db.deleteAllComentsByPostId(id, function(error){
          if(error){
            const errors="Could not delete this post, please try again later."
            const model={
              partialIsActive: true,
              errors
            }
            response.render('Home.hbs',model)
            
          }else{
            const success="The delete was successful"
            model={
              success,
              partialIsActive: true
              }
              response.render('Home.hbs',model)
            }
          
        })
      }
    })
  })

  module.exports = router
