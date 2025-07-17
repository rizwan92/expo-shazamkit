const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Fill these from your Apple Developer account
const privateKey = fs.readFileSync(
  path.join(__dirname, "AuthKey_PSZ98V944W.p8"),
  "utf8",
);
const TEAM_ID = "76G464VCJ4";
const KEY_ID = "4P7G92GB73";

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d", // Maximum allowed by Apple
  issuer: TEAM_ID,
  header: {
    alg: "ES256",
    kid: KEY_ID,
  },
});

console.log("ShazamKit Developer Token:");
console.log(token);
