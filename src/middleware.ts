import { defineMiddleware } from "astro:middleware";

// 末尾スラッシュ付きのURLを末尾スラッシュなしにリダイレクト
export const onRequest = defineMiddleware((context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // ルートパス (/) は除外
  if (pathname !== "/" && pathname.endsWith("/")) {
    // 末尾スラッシュを削除したパスを作成
    const newPathname = pathname.slice(0, -1);
    const newUrl = new URL(newPathname, url.origin);

    // クエリパラメータとハッシュを保持
    newUrl.search = url.search;
    newUrl.hash = url.hash;

    // 301リダイレクト
    return context.redirect(newUrl.toString(), 301);
  }

  return next();
});
