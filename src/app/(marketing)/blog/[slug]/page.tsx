import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug, getRelatedPosts } from "../data";
import BlogArticleContent from "./BlogArticleContent";

/* ─── Static Generation ─── */
export function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

/* ─── Dynamic Metadata ─── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    return {
        title: post.metaTitle,
        description: post.metaDescription,
        alternates: { canonical: `https://e-mailer.io/blog/${post.slug}` },
        openGraph: {
            title: post.metaTitle,
            description: post.metaDescription,
            url: `https://e-mailer.io/blog/${post.slug}`,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author.name],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.metaTitle,
            description: post.metaDescription,
        },
    };
}

/* ─── Page Component ─── */
export default async function BlogArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) notFound();

    const related = getRelatedPosts(slug, 3);

    /* JSON-LD Article structured data */
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
            "@type": "Person",
            name: post.author.name,
            jobTitle: post.author.role,
        },
        publisher: {
            "@type": "Organization",
            name: "E-mailer",
            url: "https://e-mailer.io",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://e-mailer.io/blog/${post.slug}`,
        },
        keywords: post.tags.join(", "),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />

            {/* ═══ Article Header ═══ */}
            <header className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC] border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center gap-2 text-sm text-slate-400">
                            <li>
                                <Link href="/blog" className="hover:text-slate-600 transition-colors">Blog</Link>
                            </li>
                            <li aria-hidden="true">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li>
                                <span className="text-slate-500">{post.category}</span>
                            </li>
                        </ol>
                    </nav>

                    {/* Category & Reading Time */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-50 text-cyan-600 rounded-md">
                            {post.category}
                        </span>
                        <span className="text-sm text-slate-400">{post.readingTime}</span>
                    </div>

                    {/* H1 */}
                    <h1 className="font-heading text-3xl lg:text-[2.75rem] font-semibold text-slate-900 tracking-[-0.03em] leading-tight mb-6">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-lg text-slate-500 leading-relaxed mb-8">
                        {post.excerpt}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 tracking-wide">
                            {post.author.avatar}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 text-sm">{post.author.name}</div>
                            <div className="text-sm text-slate-400">
                                {post.author.role} · Published{" "}
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                                {post.updatedAt !== post.publishedAt && (
                                    <> · Updated{" "}
                                        {new Date(post.updatedAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══ Article Body ═══ */}
            <article className="py-12 lg:py-16 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <BlogArticleContent content={post.content} />
                </div>
            </article>

            {/* ═══ Tags ═══ */}
            <div className="border-t border-slate-100 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 bg-slate-50 text-slate-500 text-sm rounded-lg border border-slate-100"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ CTA Banner ═══ */}
            <section className="bg-slate-900 text-white py-16">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Ready to put this into practice?
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
                        E-mailer automates everything you just read — AI personalization, warm-up,
                        deliverability monitoring, and smart sequences. Start free.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all"
                    >
                        Start Your Free Trial →
                    </Link>
                </div>
            </section>

            {/* ═══ Related Posts ═══ */}
            {related.length > 0 && (
                <section className="py-16 lg:py-24 bg-[#FAFBFC] border-t border-slate-100" aria-label="Related articles">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-10">
                            Keep Reading
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {related.map((r) => (
                                <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                                    <article className="h-full flex flex-col p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md">
                                                {r.category}
                                            </span>
                                            <span className="text-xs text-slate-400">{r.readingTime}</span>
                                        </div>
                                        <h3 className="font-heading text-[16px] font-semibold text-slate-900 tracking-[-0.02em] mb-3 group-hover:text-cyan-600 transition-colors leading-snug flex-1">
                                            {r.title}
                                        </h3>
                                        <div className="text-sm text-slate-400">
                                            {r.author.name}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
