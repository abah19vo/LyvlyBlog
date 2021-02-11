 const express = require('express')
 const db = require('../db')



const NAME_MIN_LENGTH=1;
const subject_MIN_LENGTH=5;
const Feedback_MIN_LENGTH=10;


function getValidationErrors(name, subject, feedbackContent){
	
	const validationErrors = []
	
	if(!isNaN(name)){
		validationErrors.push("Name can't be a number" )
  }
  if(name.length < NAME_MIN_LENGTH){
		validationErrors.push("The Name must at least be "+NAME_MIN_LENGTH+" characters")
  }
  
  if(subject.length< subject_MIN_LENGTH ){
    validationErrors.push("The subject must  at least  be "+subject_MIN_LENGTH+" characters")
  }

  if(!isNaN(subject)){
    validationErrors.push("Subject can't be a number")
  }

  if(feedbackContent.length<Feedback_MIN_LENGTH){
    validationErrors.push("The Content must at least be "+Feedback_MIN_LENGTH+" characters")

  }
  if(!isNaN(feedbackContent)){
    validationErrors.push("Content can't be a number'")

  }

  
	return validationErrors
}
const router = express.Router()
//get home page with content

router.get("/guestBook", function(request, response)  {
  db.getallFeedback(function(error, feedback){
    if(error){
      const errors = "Could not upload the guestBook page "
      const model={
        errors,
        partialIsActive: true
      }
      response.render('guestBook.hbs',model) 

    }else{
      const model ={
        feedback,
        partialIsActive: false
      }
      response.render('guestBook.hbs',model) 
    }
  })
})

router.post("/guestBook", function(request, response){

  const postname = request.body.postname
  const subject = request.body.subject
  const feedbackContent = request.body.feedbackContent

  const validationErrors = getValidationErrors(postname, subject, feedbackContent)
  
  
  
  if(0 < validationErrors.length){
      db.getallFeedback(function(error, Feedback){
        if(error){ 
          const errors= "Could not upload the guestBook page"
          const model={
            errors,
            partialIsActive: true
          }
          response.render('guestBook.hbs',model) 
      
        }else{
          const model ={
            Feedback: Feedback,
            validationErrors,
            postname,
            subject,
            feedbackContent,
            partialIsActive: false
          }
          response.render('guestBook.hbs',model) 
        }
      })
      return
  }
    
  //upload new Feedback
  db.createFeedback(postname,subject,feedbackContent, function(error){
    if (error){
      const errors="could not upload to the server, please try again later"
      const model={
        errors,
        partialIsActive: true
      }
      response.render('guestBook.hbs',model)     
      return
      
    }else{
      response.redirect('/guestBook')
    }
  })
})

  // get update content page
router.get("/update-Feedback/:fId", function(request, response){
  const id = request.params.fId
  
  db.getUpdateFeedbackById(id, function(error, Feedback){
    if(error){
      const errors="Could not display the pagecontent, please try again later "
      const model={
        errors,
        partialIsActive: true
      }
      response.render("Update-Feedback.hbs", model)
      return
    }else if(!Feedback){
      const errors="The post does not exist"
      const model={
        errors,
        partialIsActive: true
      }
      response.render("Update-Feedback.hbs", model)
      return

    }else{
      model={
        Feedback: Feedback,
        partialIsActive: false
      }
      response.render("Update-Feedback.hbs", model)
    }
  })
    
})
  
  //update the post with the specific id
router.post("/update-Feedback/:fId", function(request, response){

  const fId = request.params.fId
  const newname = request.body.postname
  const newsubject = request.body.subject
  const newFeedback = request.body.feedbackContent

  const validationErrors = getValidationErrors(newname, newsubject, newFeedback)

  if(!request.session.isLoggedIn){
    const errors="You need to be logged in to update the content"
    model={
      partialIsActive: true,
      errors
    }
    response.render("Update-Feedback.hbs", model)
    return
  }

  if(0 < validationErrors.length){
      const model = {
      validationErrors,
      Feedback:{
        postname: newname,
        subject: newsubject,
        feedbackContent: newFeedback,
      }
    }
    response.render("Update-Feedback.hbs", model)
    return
  }



  db.updateFeedbackById(newname, newsubject, newFeedback, fId,function(error){    
    if(error){
      const errors="Could not upload to the server, please try again later "
      const model={
        errors,
        partialIsActive: true
      }
      response.render('Update-Feedback.hbs',model)     
      return
    }
    else{
      const success="The update is successfull"
      model={
        partialIsActive: true,
        success
      }
      response.render('guestBook.hbs',model)
    }
  })


})

router.post("/delete-Feedback/:fId", function(request, response){
  const fId = request.params.fId

  if(!request.session.isLoggedIn){
    const errors= "You need to be logged in to delete the content"
    model={
      partialIsActive: true,
      errors
    }
    response.render("guestBook.hbs", model)
    return
  }    
  db.deleteFeedbackById(fId, function(error){

    if(error){
      const errors="Could not delete this post, please try again later. "
      const model={
        partialIsActive: true,
        errors
      }
      response.render('guestBook.hbs',model)     
      return     
    }else{
      const success = "The post is successfully deleted"
      model={
        partialIsActive: true,
        success
      }
      response.render("guestBook.hbs",model)     
    }
  })
})

module.exports = router







