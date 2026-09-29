import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

export default async () => {
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
        children: {
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
            children: [
              {
                type: "h1",
                props: {
                  style: {
                    fontSize: 72,
                    fontWeight: "bold",
                    color: "#262626",
                    marginBottom: "24px",
                  },
                  children: SITE.title,
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    fontSize: 32,
                    color: "#404040",
                    marginBottom: "40px",
                  },
                  children: SITE.desc,
                },
              },
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
                  style: { fontSize: 28, color: "#606060" },
                  children: new URL(SITE.website).hostname,
                },
              },
            ],
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(SITE.title + SITE.desc + SITE.website),
    }
  );
};
