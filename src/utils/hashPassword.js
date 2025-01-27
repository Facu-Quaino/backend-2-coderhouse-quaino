import bcrypt from "bcrypt";

//funcion que hashea la contraseña

export const createHash =(password)=> {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

//funcion que compara contraseñas

export const isValidPassword =(password, user)=> {
    return bcrypt.compareSync(password, user.password);
};