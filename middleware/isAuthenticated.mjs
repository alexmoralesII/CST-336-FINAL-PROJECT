export function isUserAuthenticated(req, res, next){
    if (req.session.authenticated) { 
      next();
   } else {
     res.redirect("/");
   }
}