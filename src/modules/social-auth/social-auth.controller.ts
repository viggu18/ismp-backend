import { Request, Response } from "express";
import { PrismaClient, Platform } from "@prisma/client";

const prisma = new PrismaClient();

const getOAuthUrl = (platform: string, userId: string) => {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
  const redirectUri = `${BACKEND_URL}/api/social-auth/${platform}/callback`;
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

  switch (platform) {
    case "instagram":
      const igClientId = process.env.INSTAGRAM_CLIENT_ID;
      if (!igClientId) throw new Error("INSTAGRAM_CLIENT_ID not configured in backend .env");
      return `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;
    
    case "tiktok":
      const tiktokClientKey = process.env.TIKTOK_CLIENT_KEY;
      if (!tiktokClientKey) throw new Error("TIKTOK_CLIENT_KEY not configured in backend .env");
      return `https://www.tiktok.com/v2/auth/authorize?client_key=${tiktokClientKey}&response_type=code&scope=user.info.basic&redirect_uri=${redirectUri}&state=${state}`;
    
    case "youtube":
      const ytClientId = process.env.YOUTUBE_CLIENT_ID;
      if (!ytClientId) throw new Error("YOUTUBE_CLIENT_ID not configured in backend .env");
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ytClientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent&state=${state}`;
    
    case "twitter":
      const xClientId = process.env.TWITTER_CLIENT_ID;
      if (!xClientId) throw new Error("TWITTER_CLIENT_ID not configured in backend .env");
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${xClientId}&redirect_uri=${redirectUri}&scope=users.read tweet.read offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export const initiateAuth = async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId query parameter is required" });
    }

    const authUrl = getOAuthUrl(platform, userId as string);
    return res.redirect(authUrl);
  } catch (error: any) {
    console.error(`[Social Auth Error] Initiate ${req.params.platform}:`, error.message);
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=not_configured&platform=${req.params.platform}`);
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=auth_denied&platform=${platform}`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=missing_params&platform=${platform}`);
    }

    const decodedState = JSON.parse(Buffer.from(state as string, "base64").toString("utf8"));
    const userId = decodedState.userId;

    if (!userId) {
      return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=invalid_state&platform=${platform}`);
    }

    // Normally we'd POST to the provider to exchange `code` for an `access_token` here.
    // E.g., await axios.post(...)

    const influencer = await prisma.influencerProfile.findUnique({
      where: { userId }
    });

    if (!influencer) {
      // Create a dummy influencer profile if it doesn't exist just so testing doesn't break
      // Since registration might not have fully created the InfluencerProfile yet
      return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=profile_not_found&platform=${platform}`);
    }

    let platformEnum: Platform | null = null;
    if (platform === "instagram") platformEnum = "INSTAGRAM";
    if (platform === "youtube") platformEnum = "YOUTUBE";
    if (platform === "tiktok") platformEnum = "TIKTOK";
    if (platform === "twitter") platformEnum = "TWITTER";

    if (platformEnum) {
      await prisma.socialAccount.upsert({
        where: {
          influencerProfileId_platform: {
            influencerProfileId: influencer.id,
            platform: platformEnum
          }
        },
        update: {
          accessToken: `live_token_${code}`,
          isVerified: true,
          lastSyncedAt: new Date()
        },
        create: {
          influencerProfileId: influencer.id,
          platform: platformEnum,
          handle: `@${platform}_user`,
          accessToken: `live_token_${code}`,
          isVerified: true,
          lastSyncedAt: new Date(),
          followerCount: 0
        }
      });
    }

    return res.redirect(`${FRONTEND_URL}/onboarding/socials?success=true&platform=${platform}`);
  } catch (error: any) {
    console.error(`[Social Auth Error] Callback ${req.params.platform}:`, error.message);
    return res.redirect(`${FRONTEND_URL}/onboarding/socials?error=callback_failed&platform=${req.params.platform}`);
  }
};
