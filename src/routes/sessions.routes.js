import { Router } from "express";
import { userDao} from "../dao/mongo/user.dao.js"
import { createHash } from "../utils/hashPassword.js";
import passport from "passport";
import { createToken } from "../utils/jwt.js";
import { passportCall } from "../middlewares/passportCall.middleware.js";
import { authorization } from "../middlewares/authorization.middleware.js";
import { UserDTO } from "../dto/user.dto.js";


const router = Router();

router.post("/register", passport.authenticate("register"), async (req,res) => {
    try {

        res.status(201).json({ status: "success", payload: "usuario registrado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Erro", msg: "Error interno del servidor" });
    }
});

router.post("/login", passportCall("login") , async (req,res) => {
    try {
        const token = createToken(req.user);
        res.cookie("token", token, { httpOnly: true });

        res.status(200).json({status: "success", payload: req.user, token});

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Erro", msg: "Error interno del servidor" });
    };
});

router.get("/profile", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(404).json({ status: "error", msg: "Usuario no logueado" })
        }
        if (req.session.user.role !== "user") {
            return res.status(403).json({ status: "error", msg: "Usuario no autorizado" })
        }

        res.status(200).json({ status: "success", payload: req.session.user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Erro", msg: "Error interno del servidor" });
    }
});

router.get("/logout", async (req,res) => {
    try {
        req.session.destroy();

        res.status(200).json({status: "success", payload: "ha cerrado sesion"});

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Erro", msg: "Error interno del servidor" });
    }
});

router.put("/restore-password", async (req,res) => {
    try {
        const {email, password} = req.body;
        const user = await userDao.getByEmail(email);

        await userDao.update(user._id, {password: createHash(password)})

        res.status(200).json({status: "success", payload: "contraseña actualizada"});

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "Erro", msg: "Error interno del servidor" });
    }
});

router.get("/google", passport.authenticate("google", 
    {scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"], 
    session: false}), 
    async (req,res) => {
    return res.status(200).json({ status: "success", session: req.user });
});

router.get("/current", passportCall("jwt"), authorization("user"), async (req,res) => {
    const user = new UserDTO(req.user)

    res.json({status: "ok", user: user});
});

export default router;
