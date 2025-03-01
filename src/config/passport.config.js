import passport from "passport";
import local from "passport-local";
import google from "passport-google-oauth20";
import jwt, { ExtractJwt } from "passport-jwt";
import { userDao } from "../dao/mongo/user.dao.js";
import { createHash, isValidPassword } from "../utils/hashPassword.js";
import { cookieExtractor } from "../utils/cookieExtractor.js";
import { cartDao } from "../dao/mongo/cart.dao.js";
import envsConfig from "./envs.config.js";

const LocalStrategy = local.Strategy;
const GoogleStrategy = google.Strategy;
const JWTStrategy = jwt.Strategy;

const extractJWT = jwt.ExtractJwt;

//!funcion global de estrategias

export const initializePassport =()=> {
    //estrategia de registro local

    passport.use("register", new LocalStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done)=>{
        try {
            
            const {first_name, last_name, age, role } = req.body;

            //verificamos si el user ya existe
            const user = await userDao.getByEmail(username);

            if (user) {
                return done(null, false, { message: "el usuario ya existe" });
            };

            const newCart = await cartDao.create();

            const newUser = {
                    first_name, 
                    last_name,
                    email: username,
                    age,
                    password: createHash(password),
                    role,
                    cart: newCart._id
            };

            const createUser = await userDao.create(newUser);

            done(null, createUser);

        } catch (error) {
            done(error)
        }
    }));

    //estrategia de login

    passport.use("login", new LocalStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = await userDao.getByEmail(username);
            const checkPass = isValidPassword(password, user);

            if (!user || !checkPass) {
                return done(null, false, { message: "email o contraseña no validos" });
            }

            done(null, user);
            
        } catch (error) {
            done(error);
        }
    }));

    //estrategia de google

    passport.use("google", 
        new GoogleStrategy({
            clientID: envsConfig.GOOGLE_CLIENT_ID,
            clientSecret: envsConfig.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/api/sessions/google"
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const {name, emails} = profile;
                const user = await userDao.getByEmail(emails[0].value);

                if (user) {
                    return cb(null, user);
                }

                const newUser = await userDao.create({
                    first_name: name.givenName,
                    last_name: name.familyName,
                    email: emails[0].value
                });

                return cb(null, newUser);

            } catch (error) {
                cb(error);
            }
        }
));

//estrategia para jwt
passport.use("jwt", 
    new JWTStrategy(
        { jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), secretOrKey: envsConfig.JWT_KEY},
    async (jwt_payload, done)=>{
    try {
        const {email} = jwt_payload;
    const user = await userDao.getByEmail(email);

        done(null, user);
    } catch (error) {
        done(error)
    }
}));

    passport.serializeUser( (user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser( async (id, done) => {
        try {
            const user = await userDao.getById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};