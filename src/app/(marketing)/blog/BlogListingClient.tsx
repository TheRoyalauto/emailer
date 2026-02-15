"use client";

import Link from "next/link";
import { useState } from "react";
import { BlogPost } from "./data";

interface BlogListingClientProps {
    posts: BlogPost[];
    categories: string[];
}

export default function BlogListingClient({ posts, categories }: BlogListingClientProps) {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = activeCategory === "All"
        ? posts
        : posts.filter((p) => p.category === activeCategory);

    return (
        <section className="py-16 lg:py-24 bg-white" aria-label="All articles">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                    <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400">
                        All Articles
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3.5 py-1.5 text-sm rounded-lg transition-colors ${activeCategory === cat
                                        ? "bg-slate-900 text-white font-semibold"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {filtered.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                            <article className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 p-6 lg:p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 bg-white">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-slate-400">{post.readingTime}</span>
                                    </div>
                                    <h3 className="font-heading text-[17px] font-semibold text-slate-900 tracking-[-0.02em] mb-2 group-hover:text-cyan-600 transition-colors leading-snug">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 lg:flex-shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                                        {post.author.avatar}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-700">{post.author.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-slate-400">No articles in this category yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
