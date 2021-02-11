const sqlite3 = require('sqlite3')
const database= new sqlite3.Database("my-database.db")
const logindb= new sqlite3.Database("logindb.db")
database.run(`
              CREATE TABLE IF NOT EXISTS BlogPost (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                title TEXT,
                content TEXT,
                position TEXT
              )


`)
database.run(`
                CREATE TABLE IF NOT EXISTS Feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    postname TEXT,
                    subject TEXT,
                    feedbackContent TEXT
                )

`)

database.run(`
                CREATE TABLE IF NOT EXISTS Comment (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    postId INTEGER,
                    name TEXT,
                    content TEXT,
                    FOREIGN KEY (postId) references BlogPost(id)
                )

`)

logindb.run(`
                CREATE TABLE IF NOT EXISTS login (
                    userId INTEGER PRIMARY KEY AUTOINCREMENT,
                    password TEXT,
                    username TEXT 
                )
`)


exports.insertPassword= function(password,username,callback){
    const query ='INSERT INTO login(password,username) VALUES (?,?)'
    const values =[password,username]
    logindb.run(query, values, function(error){
        callback(error)
    })
}

exports.getPassword = function(username,callback){
    const query = "SELECT password FROM login WHERE username = ?"
    const values = [username]
    logindb.get(query, values, function(error,hash){
        callback(error,hash)
    })
}



exports.getAllBlogPost = function(callback) {
    const query = "SELECT  * FROM BlogPost ORDER BY id  DESC"
    
    database.all(query,function(error,BlogPost){
      callback(error,BlogPost)
    })
}


exports.createContent = function(name, position, title, content,callback){
    const query= "INSERT INTO  BlogPost (name, position, title, content) VALUES (?,?,?,?)"
    
    const values =[name,position,title,content] 

    database.run(query, values, function(error){
        callback(error)

    })


}

exports.getUpdateContentById = function(id,callback){
    const query = "SELECT * FROM BlogPost WHERE id = ?"
    const values = [id]
    database.get(query, values, function(error,BlogPost){
        callback(error,BlogPost)
    })

}

exports.updateContentById= function(newname, newposition,newtitle,newcontent, id,callback){

    const query = `
		UPDATE
			BlogPost
		SET
      name = ?,
      position = ?,
      title=?,
      content=?
      WHERE   id = ?
    `
    const values = [newname, newposition,newtitle,newcontent, id]

    

    database.run(query,values,function(error){
        callback(error)
    })
}


exports.deleteContentById = function(id,callback){
    const query = "DELETE FROM BlogPost WHERE id = ?"
    const values = [id]
    database.run(query, values, function(error){
        callback(error)
    })

}

/************************************************************Feedback**************** */
exports.getallFeedback = function(callback) {
    const query = " SELECT * FROM Feedback ORDER BY id  DESC;"
    
  database.all(query,function(error,Feedback){
      callback(error,Feedback)
  })
}

exports.getFeedbackById = function(id,callback){
    const query = "SELECT * FROM Feedback WHERE id = ?"
    const values = [id]
    database.run(query, values, function(error, result){
        callback(error, result)

    })
}


exports.createFeedback = function(postname, subject, feedbackContent,callback){
    const query= "INSERT INTO  Feedback (postname, subject, feedbackContent) VALUES (?,?,?)"
    
    const values =[postname,subject,feedbackContent] 

    database.run(query, values, function(error){
        callback(error)

    })

}

exports.getUpdateFeedbackById = function(id,callback){
    const query = "SELECT * FROM Feedback WHERE id = ? "
    const values = [id]
    database.get(query, values, function(error,Feedback){
        callback(error,Feedback)
    })

}

exports.updateFeedbackById= function(newname, newsubject,newFeedback, id,callback){

    const query = `
		UPDATE
        Feedback
		SET
      postname = ?,
      subject = ?,
      feedbackContent= ?
      WHERE   id = ?
    `
    const values = [newname, newsubject,newFeedback, id]

    
    database.run(query,values,function(error){
        callback(error)
    })
}

exports.deleteFeedbackById = function(id,callback){
    const query = "DELETE  FROM Feedback WHERE id = ?"
    const values = [id]
    database.run(query, values, function(error){
        callback(error)
    })

}

/************************************************** comment */

exports.getpostById = function(id,callback){
    const query = "SELECT * FROM BlogPost WHERE id = ?"
    const values = [id]
    database.get(query, values, function(error, post){
		callback(error, post)
	})
}


exports.createComent= function(name,content,postId,callback){
    const query= "INSERT INTO  Comment (name, content,postId) VALUES (?,?,?) "
    
    const values =[name,content,postId] 

    database.run(query, values, function(error){
        callback(error)
    })

}


exports.getAllComentsById= function(postId,callback){
    const query = " SELECT * FROM Comment WHERE postId= ? ORDER BY id  DESC" 
    const values =[postId]
    database.all(query, values, function(error,coment){
        callback(error,coment)
    })
}

exports.getUpdateComentById= function(id,callback){
    const query = "SELECT * FROM Comment WHERE id = ? "
    const values = [id]
    database.get(query, values, function(error,Feedback){
        callback(error,Feedback)
    })
}
/*/**/
exports.UpdateComentById= function(newName,newComent,id,callback){
    const query = `
    UPDATE
    Comment
    SET
        name = ?,
        content = ?
    WHERE   id = ?
    `
    const values=[newName,newComent,id]
    database.run(query,values,function(error){
        callback(error)
    })

}

exports.deletComentById= function(id,callback){
    const query="DELETE  FROM Comment WHERE id = ?"
    const values = [id]
    database.run(query, values, function(error){
        callback(error)
    })
}

exports.deleteAllComentsByPostId= function(postId,callback){
    const query = "DELETE FROM Comment WHERE postId = ?"
    const values = [postId]
    database.run(query, values, function(error){
        callback(error)
    })
}
