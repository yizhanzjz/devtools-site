"use client";

import { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolLayout({
  title,
  description,
  children,
}: ToolLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-dark-400 text-sm">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
