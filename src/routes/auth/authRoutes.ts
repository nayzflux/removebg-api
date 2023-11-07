import e, { Router } from 'express';
import passport from 'passport';
import prisma from '../../lib/prisma';

const router = Router();

const CALLBACK_URL = "http://localhost:5000/api/v1/auth"

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function (user, done) {
    done(null, user);
});

const createDbUser = async (email: string, providerName: string, providerId: string) => {
    const account = await prisma.account.upsert({
        where: {
            providerId_providerName: {
                providerName: providerName,
                providerId: providerId
            }
        },
        create: {
            providerId,
            providerName,
            providerEmail: email,
            user: {
                connectOrCreate: {
                    where: {
                        email,
                    },
                    create: {
                        email
                    }
                }
            }
        },
        update: {
            providerId,
            providerName,
            providerEmail: email
        },
        include: {
            user: true
        },
    });

    console.log(account);

    return account;
}

// Google
import passportGoogle from 'passport-google-oauth2';

const GoogleStrategy = passportGoogle.Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_URL}/google/callback`,
    passReqToCallback: true,
    scope: ["profile", "email"]
}, (accessToken, refreshToken, expires_in, profile, done) => {
    createDbUser(profile.email, "google", profile.id);
    done(null, profile);
}));

// Spotify
import passportSpotify from 'passport-spotify';

const SpotifyStrategy = passportSpotify.Strategy;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

passport.use(new SpotifyStrategy({
    clientID: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    callbackURL: `${CALLBACK_URL}/spotify/callback`,
    showDialog: true,
    scope: ['user-read-email', 'user-read-private']
}, (accessToken, refreshToken, expires_in, profile, done) => {
    const email = profile.emails[0] as unknown as string;
    createDbUser(email, "spotify", profile.id);
    done(null, profile)
}));

// Discord
import passportDiscord from 'passport-discord';

const DiscordStrategy = passportDiscord.Strategy;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: `${CALLBACK_URL}/discord/callback`,
    scope: ['identify', 'email']
}, (accessToken, refreshToken, expires_in, profile, done) => {
    createDbUser(profile.email, "discord", profile.id);
    done(null, profile)
}));

// Google Provider
router.get('/google', passport.authenticate('google'));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/api/v1/auth/google' }),
    function (req, res) {
        res.redirect('/');
    }
);

// Spotify Provider
router.get('/spotify', passport.authenticate('spotify'));

router.get(
    '/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/api/v1/auth/spotify' }),
    function (req, res) {
        res.redirect('/');
    }
);

// Discord Provider
router.get('/discord', passport.authenticate('discord'));

router.get(
    '/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/api/v1/auth/discord' }),
    function (req, res) {
        res.redirect('/');
    }
);

export default router;