export function getfullName (req, res, next) {
   res.locals.FullName = req.session.fullName || "";
   next(); //next middleware/route
};