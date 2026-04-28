export function fullName (req, res, next) {
   res.locals.fullName = req.session.fullName || "";
   next(); //next middleware/route
};