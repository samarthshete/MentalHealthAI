// const { v4: uuid } = require("uuid");
// const User = require("../models/User.js");

// async function userMiddleware(req, res, next) {
//   let userId = req.cookies?.userid;

//   if (userId && userId.trim() !== "") {
//     const userExists = await User.findOne({ id: userId });

//     if (!userExists) {
//       console.log("❌ User not found in DB, generating new ID");
//       userId = uuid();
//       res.cookie("userid", userId, {
//         maxAge: 1209600000, // 14 days
//         httpOnly: true,
//         sameSite: "None",
//         secure: true,
//       });
//     }
//     req.userId = userId;
//   } else {
//     userId = uuid();
//     res.cookie("userid", userId, {
//       maxAge: 1209600000,
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//     });
//     req.userId = userId;
//   }

//   next();
// }

// module.exports = { userMiddleware };
const { v4: uuid } = require("uuid");

async function userMiddleware(req, res, next) {
  const userId = req.cookies?.userid;
  // console.log(userId);
  if (userId && userId.trim() !== "") {
    req.userId = userId;
  } else {
    const userId = uuid();
    req.userId = userId;
    // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.cookie("userid", userId, {
      maxAge: 1209600000, //14 * 24 * 60 * 60 * 1000 -> 14days
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
  }

  next();
}

module.exports = { userMiddleware };
