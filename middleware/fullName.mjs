export function getFullName(req, res, next) {
    res.locals.fullName = req.session.username || null;
    res.locals.isAdmin = req.session.isAdmin || false;
    next();
}

