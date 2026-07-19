import {login, register, logout, refreshToken, getme} from '../services/authService.js';

const loginController = async (req, res) => {
  await login(req, res);
};

const registerController = async (req, res) => {
  await register(req, res);
};

const logoutController = async (req, res) => {
  await logout(req, res);
};

const refreshTokenController = async (req, res) => {
  await refreshToken(req, res);
};

const getmeController = async (req, res) => {
  await getme(req, res);
};

export { loginController, registerController, logoutController, refreshTokenController, getmeController };