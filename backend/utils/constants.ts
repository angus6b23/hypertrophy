if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in production");
}

export const jwtSecret =
  process.env.NODE_ENV === "production"
    ? process.env.JWT_SECRET!
    : "88a01a0068f8650f67cf9492f795fa52036e5f6540211359569cc610ef893dd3d8f20afc6ce9b3ab67db9eae1427bb8d9a0ccc4752ee5b030ec08551ef94ad30db5128ff6c5f7f308eeb947fd873c3b1b6aac58333bd259ddc108745012dd54d1800d7b85ec342cfb7a21fc836d8ea132fca7d2a150fb740aacff55e42b4e471cf086971b253e3fcb44e1d2e8a0608b4931d6c1842e3805ce8f758c799658c0a8464dc1caeb4687193859da4a719a3e9521f50412d744270267ea5c16da8da4ae2eed2693f750d7230d29610f2fb193fd0ff6e669655cb577719f81fb249876661efd440fad9a670783e79a06606423a22d47e4ea12bfb5c93b18f2ea4b631c7";
