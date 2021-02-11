const express = require('express')
const db = require('../db')

const NAME_MIN_LENGTH=1;
const TITLE_MIN_LENGTH=2;

function getValidationErrors(name, content){
	
	const validationErrors = []
	
	if(name.length < NAME_MIN_LENGTH || !isNaN(name)){
		validationErrors.push("The Name must at least be "+NAME_MIN_LENGTH+" character and Name can't be a number" )
  }
  
  if(content.length < TITLE_MIN_LENGTH || !isNaN(content)){
    validationErrors.push("The Coment must  at least  be "+TITLE_MIN_LENGTH+" characters and Coment can't be a number")
  }

	return validationErrors
}

const router = express.Router()

router.get("/post/:id",function(request, response){
    const id = request.params.id
  
    db.getpostById(id,function(error,blogPost){
      if(error){ 
        const errors="Something went wrong please come back later1"

        const model={
          errors,
          partialIsActive:true
        }
        response.render('postById.hbs',model)
      }else if(!blogPost){
        errors="The post does not exist"
        const model={
          errors,
          partialIsActive: true
        }
        response.render('postById.hbs',model)
        return
      }else{
        db.getAllComentsById(id,function(error,comment){
          if(error){ 
            const errors="Something went wrong please come back later"

            const model={
              errors,
              partialIsActive:true
            }
            response.render('postById.hbs',model)
          }else{
            const model={
              blogPost,
              comment,
              blogPost
            }
            response.render('postById.hbs',model)
          }
        })
      }
    })
})
  
  
  
router.post("/post/:id",function(request, response){
    const id = request.params.id
    const name= request.body.name
    const content= request.body.content
    const validationErrors = getValidationErrors(name, content)
    if(0 < validationErrors.length){
  
      db.getpostById(id,function(error,blogPost){
        if(error){ 
          const errors="something went wrong please come back later"
          const model={
            errors,
            partialIsActive:true
          }
          response.render('postById.hbs',model)
        }else{
        db.getAllComentsById(id,function(error,comment){
          if(error){ 
            const errors="something went wrong please come back later"
            const model={
              errors,
              partialIsActive:true
            }
            response.render('postById.hbs',model)
          }else{        
            const model={
              validationErrors,
              comment,
              blogPost,
              name,
              content
            }
            response.render('postById.hbs',model)
          }
        })
        }
      })
      return
    }
  
    db.getpostById(id,function(error,blogPost){
      if(error){ 
        errors="Something went wrong please come back later"

        const model={
          errors,
          partialIsActive:true
        }
        response.render('postById.hbs',model)
      }else{
        if(!blogPost){
          errors="The post does not exist"
          const model={
            errors,
            partialIsActive: true
          }
          response.render('postById.hbs',model)
          return
        }
        db.createComent(name,content,id,function(error){
          if (error){
            errors="could not upload to the server, please try again later"
            const model={
              partialIsActive:true,
              errors
            }
            response.render('/post/'+id,model)     
            return 
          }else{
            response.redirect( '/post/'+id)
          }
        })
     
      }
    })
  })
  
  
  
router.post("/:id/coment/delete/:cId", function(request, response){
    const cId = request.params.cId
    const id = request.params.id
    
    if(!request.session.isLoggedIn){
      const errors="You need to be logged in to update the content"
      model={
        partialIsActive: true,
        errors
      }
      response.render("postById.hbs", model)
      return
    }
    
    db.deletComentById(cId, function(error){
      
      if(error){
        const errors="Could not delete this post, please try again later. "
        const model={
          partialIsActive: true,
          errors
        }
        response.render('postById.hbs',model)     
        return     
      }else{
        response.redirect('/post/'+id)

      }
    })
  
  })
  


router.get("/:id/coment/update/:cId", function(request, response){
    const cId = request.params.cId
    db.getUpdateComentById(cId, function(error, comment) {
        
      if(error){
        const errors ="Could not upload the page, please try again later "
        const model={
          errors,
          dbUdError: true
        }
        response.render("Update-coment.hbs", model)
        return
      }else if(!comment){
        const errors="The comment does not exist"
        const model={
          errors,
          partialIsActive: true
        }

        response.render('postById.hbs',model)
        return
        
      }else{
        const model = {
          comment: comment,
          partialIsActive: false
        }
        response.render("Update-coment.hbs", model)
      }
      
    })
  
  })
  
  
  
router.post("/:id/coment/update/:cId", function(request, response){
    const id = request.params.id
    const cId = request.params.cId
    const newname = request.body.name
    const newcontent = request.body.content
  
    const validationErrors = getValidationErrors(newname, newcontent)
    if(!request.session.isLoggedIn){
      errors="You need to be logged in to update the content"
      model={
        dbUdError: true,
        errors
      }
      response.render("Update-coment.hbs", model)
      return
    }
  
  
    if(0 < validationErrors.length){
      const model = {
        validationErrors,
        coment:{
        cname:newname,
        cContent: newcontent
      }
    }
    response.render("Update-coment.hbs", model)
    return
    }
  


    db.getUpdateComentById(cId, function(error, comment) {
      if(error){
        const errors ="Could not upload the page, please try again later "
        const model={
          errors,
          dbUdError: true
        }
        response.render("Update-coment.hbs", model)
        return
      }else if(!comment){
        const errors="The comment does not exist"
        const model={
          errors,
          partialIsActive: true
        }
        response.render('Update-coment.hbs',model)
        return
        
      }else{
        db.UpdateComentById(newname,newcontent, cId,function(error){
          if(error){
            const errors ="Could not upload to the server, please try again later "
            const model={
              errors,
              partialIsActive: true
            }
            response.render('Update-coment.hbs',model)     
            return
          }else{     
            response.redirect('/post/'+id)   
          }
        })
      }
    })
  })
  

module.exports = router
