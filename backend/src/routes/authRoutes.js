import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { userServices } from '../services/userServices.js';
import { jwtHelper } from '../config/jwt.js';

const Router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8017';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "240hr";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-tuanta.com-green-cat-a@";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "240hr";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-tuandev-green-cat-a@";

const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${BACKEND_URL}/v1/auth/google/callback`
);

// Redirect to Google OAuth
Router.get('/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile'],
        prompt: 'consent'
    });
    res.redirect(authUrl);
});

// Google OAuth callback
Router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await userServices.GetUserByEmail(email);

        if (!user) {
            // Create new user
            const newUserData = {
                email,
                fullname: name,
                avatar: picture,
                googleId,
                password: null,
                roles: ['user'],
                phone: ''
            };
            await userServices.CreatedUserGoogle(newUserData);
            user = await userServices.GetUserByEmail(email);
        } else if (!user.googleId) {
            // Link Google account to existing user
            await userServices.UpdateUserGoogleId(user._id, googleId, picture);
        }

        // Generate JWT tokens
        const tokenPayload = {
            _id: user._id.toString(),
            email: user.email,
            fullname: user.fullname,
            roles: user.roles
        };

        const accessToken = await jwtHelper.generateToken(tokenPayload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generaterefresh(tokenPayload, refreshTokenSecret, refreshTokenLife);

        // Redirect to frontend with tokens
        res.redirect(`${FRONTEND_URL}/login?accessToken=${accessToken}&refreshToken=${refreshToken}`);

    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
});

export default Router;
