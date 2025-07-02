"use client";
import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";

export default function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}

export const products = [
  {
    title: "Core Ledger System",
    link: "#core-ledger",
    thumbnail: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Payment Orchestration",
    link: "#payments",
    thumbnail: "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "KYC Automation",
    link: "#kyc",
    thumbnail: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Compliance Engine",
    link: "#compliance",
    thumbnail: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Smart Routing",
    link: "#routing",
    thumbnail: "https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Treasury Management",
    link: "#treasury",
    thumbnail: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Risk Engine",
    link: "#risk",
    thumbnail: "https://images.pexels.com/photos/7567526/pexels-photo-7567526.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "API Gateway",
    link: "#api",
    thumbnail: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Analytics Dashboard",
    link: "#analytics",
    thumbnail: "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Reconciliation Engine",
    link: "#reconciliation",
    thumbnail: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Webhook Management",
    link: "#webhooks",
    thumbnail: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Security Console",
    link: "#security",
    thumbnail: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Ops Dashboard",
    link: "#ops",
    thumbnail: "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Developer Tools",
    link: "#dev-tools",
    thumbnail: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Monitoring Suite",
    link: "#monitoring",
    thumbnail: "https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];