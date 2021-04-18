const { Router } = require("express");
const { check } = require("express-validator");
const { login } = require("../controllers/authController");
const { validarUsuario } = require("../middlewares/usuarioRequest");

const router = Router();

router.post('/login', [
    check('email', 'Debes introducir un correo').isEmail(),
    check('password', 'Debes introducir una contraseña').notEmpty(),
    validarUsuario
], login);

module.exports = router;