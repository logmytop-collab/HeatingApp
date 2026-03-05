import {
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  verifyToken,
} from "./../middleware/authJwt.js";

function allAccess(req, res) {
  res.status(200).send("Public Content.");
}

function userBoard(req, res) {
  res.status(200).send("User Content.");
}

function adminBoard(req, res) {
  res.status(200).send("Admin Content.");
}

function moderatorBoard(req, res) {
  res.status(200).send("Moderator Content.");
}

export default function userRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", allAccess);

  app.get("/api/test/user", [verifyToken], userBoard);

  app.get("/api/test/mod", [verifyToken, isModerator], moderatorBoard);

  app.get("/api/test/admin", [verifyToken, isAdmin], adminBoard);
}
