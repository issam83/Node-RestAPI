require('babel-register')
const express = require('express')
const morgan = require('morgan')
const {success, error} = require('./function')
const config = require('./config')
const mysql = require('mysql')

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nodejs'
});


db.connect((err) => {
    if (err) {
        console.log(err.message)
    }else {

        console.log('connectéé')

        const app = express()


        let MembresRouter = express.Router()
        
        app.use(morgan('dev'))
        app.use(express.json())
        app.use(express.urlencoded({ extended: true })) 
        
        MembresRouter.route('/:id')
        
            // Recupère un memebre avec son id
            .get((req, res) => {

                db.query('SELECT * FROM membres WHERE id = ?', [req.params.id], (err, result) => {
                    if(err) {
                        res.json(error(err.message))
                    }else {

                        if(result[0] != undefined){
                            res.json(success(result[0]))
                        }else {
                            res.json(error('Wrong id'))
                        }
                    }
                })
            })
        
            // Modifie un memebre avec son id
            .put((req, res) => {

                if(req.body.name) {

                    db.query('SELECT * FROM membres WHERE id = ?', [req.params.id], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        }else {
    
                            if(result[0] != undefined){
                                
                                db.query('SELECT * FROM membres WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                                    if(err) {
                                        res.json(error(err.message))
                                    }else {
                                        if(result[0] != undefined) {
                                            res.json(error('same name'))
                                        }else {

                                            db.query('UPDATE membres SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                                                if(err) {
                                                    res.json(error(err.message))
                                                }else {
                                                    res.json(success(true))
                                                }
                                            })
                                        }
                                    }
                                })

                            }else {
                                res.json(error('Wrong id'))
                            }
                        }
                    })

                }else {
                    res.json(error('no name value'))
                }
            })
        
        
            // Supprime un memebre avec son id
            .delete((req, res) => {

                db.query('SELECT * FROM membres WHERE id = ?', [req.params.id], (err, result) => {
                    if(err) {
                        res.json(error(err.message))
                    }else {

                        if(result[0] != undefined){

                            db.query('DELETE FROM membres WHERE id = ?', [req.params.id], (err, result) => {
                                if(err){
                                    res.json(error(err.message))
                                }else {
                                    res.json(success(true))
                                }
                            })

                        }else {
                            res.json(error('Wrong id'))
                        }
                    }
                })
            })
        
        MembresRouter.route('/')
        
            // Recupère tous les memebres
            .get((req, res) => {
                if (req.query.max != undefined && req.query.max > 0){

                    db.query('SELECT * FROM membres LIMIT 0, ?', [req.query.max], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        }else {
                            res.json(success(result))
                        }
                    })

                }else if (req.query.max != undefined) {
                    res.json(error('Wrong max value'))
                }else {

                    db.query('SELECT * FROM membres', (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        }else {
                            res.json(success(result))
                        }
                    })

                }
            })
        
            //Créer un membre avec son nom
            .post((req, res) => {
                if(req.body.name){

                    db.query('SELECT * FROM membres WHERE name = ?', [req.body.name], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        }else {
    
                            if(result[0] != undefined){
                                res.json(error('name already used'))
                            }else {
                                
                                db.query('INSERT INTO membres(name) VALUES(?)', [req.body.name], (err, result) => {
                                    if(err) {
                                        res.json(error(err.message))
                                    }else {

                                        db.query('SELECT * FROM membres WHERE name = ?', [req.body.name], (err, result) => {
                                            if(err) {
                                                res.json(error(err.message))
                                            }else {
                                                res.json(success({
                                                    id: result[0].id,
                                                    name: result[0].name
                                                }))
                                                
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
        
                }else {
                    res.json(error('no name value'))
                }
            })
        
        app.use(config.rootAPI + 'membres', MembresRouter)
        
        app.listen(config.port, () => {
            console.log('Started on port' + ' ' +config.port)
        })

    }
})
























// app.get('/api', (req, res) => {
        //     res.send('Root API')
        // })
        
        // app.get('/api/v1', (req, res) => {
        //     res.send('API V1')
        // })
        
        // app.get('/api/v1/books/:id/:id2', (req, res) => {
        //     res.send(req.params)
        // })