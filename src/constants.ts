import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconGitHub from "simple-icons/icons/github.svg";
import IconBrandX from "simple-icons/icons/x.svg";
import IconFacebook from "simple-icons/icons/facebook.svg";
import IconHatenabookmark from "simple-icons/icons/hatenabookmark.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
  iconStyle: "outline" | "filled";
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/yucchiy",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
    iconStyle: "filled",
  },
  {
    name: "X",
    href: "https://x.com/yucchiy_",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
    iconStyle: "filled",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/yucchiy/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
    iconStyle: "outline",
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
    iconStyle: "filled",
  },
  {
    name: "Hatena Bookmark",
    href: "https://b.hatena.ne.jp/entry/",
    linkTitle: `Share this post on Hatena Bookmark`,
    icon: IconHatenabookmark,
    iconStyle: "filled",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
    iconStyle: "filled",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: `Share this post on LinkedIn`,
    icon: IconLinkedin,
    iconStyle: "outline",
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
    iconStyle: "outline",
  },
] as const;
