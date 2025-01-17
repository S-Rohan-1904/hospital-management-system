import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Client secret
      callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
    },
    async function (token, tokenSecret, profile, done) {
      try {
        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            $setOnInsert: {
              fullName: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile._json.picture,
              role: "patient",
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  await User.findById(id, function (err, user) {
    done(err, user);
  });
});

export default passport;
