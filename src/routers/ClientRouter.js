const express = require('express');
const router = express.Router();

module.exports = function (io) {
    const auth=(req, res, next)=>{
        if(!req.session.usuario){
            return res.redirect('/login')
        }
    
        next()
    }
    
    router.use(auth)
    
    router.get('/', (req,res)=>{
    
        let clientes=[]
    
        res.setHeader('Content-Type','application/json')
        res.status(200).json({clientes})
    })

    return router;
}