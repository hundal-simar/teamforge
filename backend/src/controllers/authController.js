import {login, register, logout, refreshToken, getme} from '../services/authService.js';

export const loginController = async (req, res) => {
  await login(req, res);
};

export const registerController = async (req, res) => {
  await register(req, res);
};

export const logoutController = async (req, res) => {
  await logout(req, res);
};

export const refreshTokenController = async (req, res) => {
  await refreshToken(req, res);
};

export const getmeController = async (req, res) => {
  await getme(req, res);
};

