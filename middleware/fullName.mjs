export function getFullName(req, res, next) {
    res.locals.fullName = req.session.username || null;
    next();
}

