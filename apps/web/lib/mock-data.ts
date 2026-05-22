export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/blogs" },
  { label: "Authors", href: "/profile" },
  { label: "Dashboard", href: "/dashboard/author" },
];

export const featuredPosts = [
  {
    title: "Designing a modern writer-first publishing experience",
    description: "Build premium editorial layouts with fluid typography, modular cards, and rich storytelling.",
    author: "Maya Reed",
    role: "Author",
    date: "Jun 28, 2026",
    readTime: "6 min read",
    category: "Design",
    likes: 382,
    comments: 18,
    cover: "bg-gradient-to-br from-violet-500 via-blue-500 to-sky-400",
    slug: "writer-first-publishing-experience",
  },
  {
    title: "How to ship editorial systems with premium SaaS polish",
    description: "Craft a scalable blog platform with role-based content workflows and delightful user interactions.",
    author: "Noah Vega",
    role: "Admin",
    date: "Jun 24, 2026",
    readTime: "8 min read",
    category: "Product",
    likes: 458,
    comments: 34,
    cover: "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500",
    slug: "ship-editorial-systems",
  },
];

export const trendingCategories = [
  { label: "UI/UX", count: "32k" },
  { label: "Product", count: "18k" },
  { label: "Writing", count: "24k" },
  { label: "Growth", count: "9k" },
  { label: "Business", count: "14k" },
];

export const trendingTags = [
  "SaaS", "Design System", "Editorial", "Markdown", "Analytics", "Productivity", "Launch", "Brand" , "Remote"
];

export const recommendedPosts = [
  {
    title: "A premium app shell for creators and readers",
    author: "Sofia Lin",
    date: "Jun 22, 2026",
    readTime: "5 min read",
    tags: ["Design", "Web"],
    views: "21.4k",
    slug: "premium-app-shell",
  },
  {
    title: "Building a light/dark editorial system with motion",
    author: "Jordan Hart",
    date: "Jun 20, 2026",
    readTime: "7 min read",
    tags: ["Motion", "Accessibility"],
    views: "18.2k",
    slug: "dark-editorial-system",
  },
  {
    title: "How role-based publishing accelerates workflow",
    author: "Mina Patel",
    date: "Jun 18, 2026",
    readTime: "4 min read",
    tags: ["Workflow", "Admin"],
    views: "15.7k",
    slug: "role-based-publishing",
  },
];

export const authorSpotlights = [
  {
    name: "Riley Brooks",
    title: "Lead Product Writer",
    followers: "12.4k",
    avatar: "RB",
    highlight: "Favorite topics: product design, growth systems, creator tools.",
  },
  {
    name: "Elena Kim",
    title: "Editorial Designer",
    followers: "8.9k",
    avatar: "EK",
    highlight: "Crafts accessible reading experiences for mobile-first audiences.",
  },
  {
    name: "Owen Clark",
    title: "Publishing Strategist",
    followers: "6.2k",
    avatar: "OC",
    highlight: "Focuses on audience retention, newsletters, and evergreen stories.",
  },
];

export const analyticsCards = [
  { label: "Total views", value: "284.6k", delta: "+18.2%", icon: "Eye" },
  { label: "Likes", value: "112.4k", delta: "+12.8%", icon: "Heart" },
  { label: "Comments", value: "14.8k", delta: "+9.3%", icon: "MessageCircle" },
  { label: "Followers", value: "42.1k", delta: "+21.6%", icon: "Users" },
];

export const authorPosts = [
  {
    title: "Draft — Refine your story structure",
    status: "Draft",
    updated: "Today",
    views: "4.2k",
    published: "—",
  },
  {
    title: "Publish — Deep work rhythms for writers",
    status: "Published",
    updated: "Jun 18, 2026",
    views: "16.4k",
    published: "Jun 19, 2026",
  },
  {
    title: "Scheduled — Launching editorial newsletters",
    status: "Scheduled",
    updated: "Jun 20, 2026",
    views: "8.0k",
    published: "Jun 26, 2026",
  },
];

export const adminUsers = [
  {
    name: "Aaliyah Jones",
    email: "aaliyah@example.com",
    role: "Admin",
    joined: "Jan 2025",
    status: "Active",
  },
  {
    name: "Kai Nguyen",
    email: "kai@example.com",
    role: "Author",
    joined: "Mar 2025",
    status: "Active",
  },
  {
    name: "Imani Brooks",
    email: "imani@example.com",
    role: "Reader",
    joined: "May 2025",
    status: "Pending",
  },
  {
    name: "Leo Spencer",
    email: "leo@example.com",
    role: "Author",
    joined: "Jul 2025",
    status: "Banned",
  },
];

export const authorActivity = [
  { label: "Reading history", value: "42 articles" },
  { label: "Saved posts", value: "18 bookmarks" },
  { label: "Recommended", value: "Personalized feed" },
];

export const blogFeed = Array.from({ length: 8 }, (_, index) => ({
  title: `Modern editorial systems for story-led SaaS (${index + 1})`,
  description: "A premium blog card with reading time, author details, tags, and subtle glassmorphism.",
  author: `Author ${index + 1}`,
  date: `Jun ${11 + index}, 2026`,
  readTime: `${4 + index} min read`,
  tags: ["Editorial", "UX", "Product"],
  likes: 200 + index * 18,
  comments: 12 + index * 2,
  slug: `blog-${index + 1}`,
}));

export const sidebarToc = [
  "Overview",
  "Design system",
  "Content structure",
  "Analytics",
  "Publication", 
  "Takeaway",
];
