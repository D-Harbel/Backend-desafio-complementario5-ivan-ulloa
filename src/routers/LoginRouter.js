const express = require('express');
const router = express.Router();


module.exports = function (io) {
    const auth=(req, res, next)=>{
        if(!req.session.usuario){
            res.redirect('/login')
        }
    
        next()
    }
    
    router.get('/',(req,res)=>{
    
        res.setHeader('Content-Type','text/html')
        res.status(200).render('home')
    })
    
    router.get('/registrate',(req,res)=>{
    
        let {error}=req.query
    
        res.setHeader('Content-Type','text/html')
        res.status(200).render('registrate', {error})
    })
    
    router.get('/login',(req,res)=>{
    
        let {error, mensaje}=req.query
    
        res.setHeader('Content-Type','text/html')
        res.status(200).render('login', {error, mensaje})
    })
    
    router.get('/perfil', auth, (req,res)=>{
    
        let usuario=req.session.usuario
    
        res.setHeader('Content-Type','text/html')
        res.status(200).render('perfil', {usuario})
    })

    router.get('/ResPass', (req, res) => {
        res.render('ResPass');
    });

    

    return router;
};