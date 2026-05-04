export function isUserAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}