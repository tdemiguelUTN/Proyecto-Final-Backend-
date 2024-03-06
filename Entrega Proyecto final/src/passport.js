import passport from "passport";
import { usersService } from "./services/users.service.js"
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { compareData } from "./utils.js";
import config from "./config.js";

//// LOCAL STRATEGY ////
passport.use(
  "signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, done) => {
      try {
        const userDB = await usersService.findByEmail(email);
        if (userDB) {
          return done(null, false);
        }
        const userCreate = await usersService.createOne(req.body);
        done(null, userCreate);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const userDB = await usersService.findByEmail(email);
        if (!userDB) {
          return done(null, false);
        }
        const isValid = await compareData(password, userDB.password);
        if (!isValid) {
          return done(null, false);
        }
        done(null, userDB);
      } catch (error) {
        done(error);
      }
    }
  )
);

//// GITHUB STRATEGY ////
passport.use("github",
  new GithubStrategy(
    {
      clientID: config.github_client_id,
      clientSecret: config.github_client_secret,
      callbackURL: config.github_callback_url,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const userDB = await usersService.findByEmail(profile._json.email);
        //login
        if (userDB) {
          if (userDB.from_github) {
            return done(null, userDB);
          } else if (userDB.from_google) {
            return done(null, userDB)
          }
          return done(null, false);
        }
        //signup
        const newUser = {
          first_name: profile._json.name.split(" ")[0],
          last_name: profile._json.name.split(" ").slice(1).join(" "),
          email: profile._json.email || profile.emails[0].value,
          password: " ",
          from_github: true,
        };
        const userCreate = await usersService.createOne(newUser);
        done(null, userCreate);
      } catch (error) {
        done(error);
      }
    }
  )
);

//// GOOGLE STRATEGY ////
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userDB = await usersService.findByEmail(profile._json.email);
        //login
        if (userDB) {
          if (userDB.from_google) {
            return done(null, userDB);
          } else if (userDB.from_github) {
            return done(null, userDB)
          } else {
            return done(null, false);
          }
        }
        //signup
        const infoUser = {
          first_name: profile._json.given_name,
          last_name: profile._json.family_name ?? " ",
          email: profile._json.email,
          password: " ",
          from_google: true,
        };
        const createdUser = await usersService.createOne(infoUser);
        done(null, createdUser);
      } catch (error) {
        done(error);
        }
      done(null, false);
    }
  )
);

//METODOS
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await usersService.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});