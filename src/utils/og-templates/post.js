import satori from "satori";
// import { html } from "satori-html";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

// const markup = html`<div
//       style={{
//         background: "#fefbfb",
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <div
//         style={{
//           position: "absolute",
//           top: "-1px",
//           right: "-1px",
//           border: "4px solid #000",
//           background: "#ecebeb",
//           opacity: "0.9",
//           borderRadius: "4px",
//           display: "flex",
//           justifyContent: "center",
//           margin: "2.5rem",
//           width: "88%",
//           height: "80%",
//         }}
//       />

//       <div
//         style={{
//           border: "4px solid #000",
//           background: "#fefbfb",
//           borderRadius: "4px",
//           display: "flex",
//           justifyContent: "center",
//           margin: "2rem",
//           width: "88%",
//           height: "80%",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "space-between",
//             margin: "20px",
//             width: "90%",
//             height: "90%",
//           }}
//         >
//           <p
//             style={{
//               fontSize: 72,
//               fontWeight: "bold",
//               maxHeight: "84%",
//               overflow: "hidden",
//             }}
//           >
//             {post.data.title}
//           </p>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               width: "100%",
//               marginBottom: "8px",
//               fontSize: 28,
//             }}
//           >
//             <span>
//               by{" "}
//               <span
//                 style={{
//                   color: "transparent",
//                 }}
//               >
//                 "
//               </span>
//               <span style={{ overflow: "hidden", fontWeight: "bold" }}>
//                 {post.data.author}
//               </span>
//             </span>

//             <span style={{ overflow: "hidden", fontWeight: "bold" }}>
//               {SITE.title}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>`;

export default async post => {
  return satori(
    {
      type: "div",
      props: {
        style: {
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #a5b4fc 100%)",
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
              children: [
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: 52,
                      fontWeight: "bold",
                      color: "#1e293b",
                      lineHeight: 1.3,
                      marginBottom: "40px",
                    },
                    children: post.data.title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      width: "100%",
                      height: "4px",
                      background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                      marginBottom: "40px",
                    },
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 32,
                      color: "#334155",
                      fontWeight: "normal",
                    },
                    children: SITE.title,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(post.data.title + SITE.title),
    }
  );
};
