function isAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo puede acceder el usuario con rol ADMIN.' });
    }
}

function isAdminOrPremium(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && (usuario.role === 'admin' || usuario.role === 'premium')) {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo pueden acceder los usuarios con rol ADMIN o PREMIUM.' });
    }
}

function isUserOrPremium(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && (usuario.role === 'user' || usuario.role === 'premium')) {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo pueden acceder los usuarios con rol ADMIN o PREMIUM.' });
    }
}



function redirectToHomeIfAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        return res.status(403).render('home', { error: 'Solo pueden acceder los usuario con rol USER o PREMIUM.', errorColor: 'red' });
    }
    next();
}



module.exports = { isAdmin, redirectToHomeIfAdmin,  isAdminOrPremium, isUserOrPremium };