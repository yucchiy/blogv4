import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

export default async post => {
  // タイトルが70文字を超える場合はdescriptionを表示しない
  const showDescription = post.data.title.length <= 70;

  const children = [
    {
      type: "h1",
      props: {
        style: {
          fontSize: 52,
          fontWeight: "bold",
          color: "#262626",
          lineHeight: 1.3,
          marginBottom: showDescription ? "30px" : "40px",
        },
        children: post.data.title,
      },
    },
  ];

  if (showDescription) {
    children.push({
      type: "p",
      props: {
        style: {
          fontSize: 28,
          color: "#606060",
          lineHeight: 1.5,
          marginBottom: "40px",
        },
        children: post.data.description,
      },
    });
  }

  children.push(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "4px",
          background: "#a04f45",
          marginBottom: "40px",
        },
      },
    },
    {
      type: "div",
      props: {
        style: {
          fontSize: 32,
          color: "#404040",
          fontWeight: "normal",
        },
        children: SITE.title,
      },
    }
  );

  const fontsText = showDescription
    ? post.data.title + post.data.description + SITE.title
    : post.data.title + SITE.title;

  return satori(
    {
      type: "div",
      props: {
        style: {
          background: "#d4a89f",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        },
        children: [
          // 白いコンテンツパネル
          {
            type: "div",
            props: {
              style: {
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "80px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              },
              children,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(fontsText),
    }
  );
};
