import Link from "next/link";
import { Metadata } from "next";
import { blogPosts, categories } from "./data";
import BlogListingClient from "./BlogListingClient";
import NewsletterForm from "./NewsletterForm";

export const metadata: Metadata = {
    title: "Blog — Cold Email Strategy, Deliverability, and Sales Growth",
    description: "Expert guides on cold email strategy, email deliverability, AI-powered outreach, and sales growth. Backed by data from 12M+ emails sent through E-mailer.",
    alternates: { canonical: "https://e-mailer.io/blog" },
    openGraph: {
        title: "E-mailer Blog — Cold Email Strategy & Sales Growth",
        description: "Expert guides on cold email, deliverability, and sales growth. Backed by real data.",
        url: "https://e-mailer.io/blog",
        type: "website",
    },
};

export default function BlogPage() {
    const featured = blogPosts.filter((p) => p.featured);
    const categoriesArr = [...categories];

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        The E-mailer Blog
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Deep dives on cold email strategy, deliverability, and outbound sales.
                        Written by practitioners. Backed by data from 12M+ emails.
                    </p>
                </div>
            </section>

            {/* Featured Posts */}
            {featured.length > 0 && (
                <section className="py-12 bg-white border-b border-slate-100" aria-label="Featured articles">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8">
                            Featured
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featured.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                                    <article className="h-full flex flex-col p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-50 text-cyan-600 rounded-md">
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-slate-400">{post.readingTime}</span>
                                        </div>
                                        <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-3 group-hover:text-cyan-600 transition-colors leading-snug">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">
                                            {post.excerpt.length > 140 ? post.excerpt.slice(0, 140) + "..." : post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                                                {post.author.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">{post.author.name}</div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Posts with Filtering */}
            <BlogListingClient posts={blogPosts} categories={categoriesArr} />

            {/* Newsletter CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Get cold email tips in your inbox
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Weekly insights on outbound strategy, deliverability, and AI-powered sales.
                        Read by hundreds of sales professionals.
                    </p>
                    <NewsletterForm />
                    <p className="mt-4 text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
                </div>
            </section>
        </>
    );
}
