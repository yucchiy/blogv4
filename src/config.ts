export const SITE = {
  website: "https://blog.yucchiy.com/", // replace this with your deployed domain
  author: "向井 祐一郎",
  profile: "https://blog.yucchiy.com/",
  desc: "Unityエンジニアの yucchiy の ノートです。",
  title: "Yucchiy's Note",
  ogImage: "astropaper-og.jpg",
  favicon: "favicon.png",
  lightAndDarkMode: true,
  postPerIndex: 10,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ja", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Tokyo", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;

export const CONTENT_CONFIG = {
  posts: {
    title: "Posts",
    description: "技術記事やブログポストを投稿しています。",
    url: "/posts",
  },
  projects: {
    "unity-weekly": {
      title: "Unity Weekly",
      description: "週次でUnityの最新情報をまとめています。",
      url: "/project/unity-weekly/page",
    },
    "directx12-csharp": {
      title: "DirectX 12 C# Tutorial",
      description: "C#でDirectX 12を学ぶチュートリアルシリーズです。",
      url: "/project/directx12-csharp/page",
    },
    "opentk-opengl": {
      title: "OpenTK OpenGL Tutorial",
      description: "OpenTKを使ったOpenGL入門シリーズです。",
      url: "/project/opentk-opengl/page",
    },
  },
} as const;
