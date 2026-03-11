const fs = require('fs');

const content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');
const lines = content.split('\n');

// Take exactly lines 1 to 690 (index 0 to 689)
const goodLines = lines.slice(0, 690).join('\n');

const tail = `
                                {/* === BILLING & PLANS === */}
                                {activeSection === "billing" && (
                                    <div className="space-y-6">
                                        {/* Current Plan */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Current Plan</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">You&apos;re on the <span className="font-semibold text-cyan-600">{getTierDisplayName(currentPlan)}</span> plan</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Daily Limit</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.dailyLimit === Infinity ? "∞" : featureGate.dailyLimit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Monthly Limit</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.monthlyLimit === Infinity ? "∞" : featureGate.monthlyLimit.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Email Accounts</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.emailAccountCount}/{featureGate.emailAccountLimit === Infinity ? "∞" : featureGate.emailAccountLimit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Tier</div>
                                                    <div className="text-xl font-bold font-heading text-cyan-600 dark:text-cyan-400 tracking-[-0.03em] capitalize">
                                                        {currentPlan}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Meters */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">📤 Daily Emails</h3>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {featureGate.emailsSentToday} / {featureGate.dailyLimit === Infinity ? "∞" : featureGate.dailyLimit}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className={"h-full rounded-full transition-all duration-700 " + (featureGate.dailyUsagePercent > 90 ? "bg-red-500" : featureGate.dailyUsagePercent > 70 ? "bg-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500")}
                                                        style={{ width: \`\${Math.min(100, featureGate.dailyUsagePercent)}%\` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {featureGate.dailyLimit === Infinity ? "Unlimited sending" : \`\${Math.max(0, featureGate.dailyLimit - featureGate.emailsSentToday)} emails remaining today\`}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">📊 Monthly Emails</h3>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {featureGate.emailsSentThisMonth.toLocaleString()} / {featureGate.monthlyLimit === Infinity ? "∞" : featureGate.monthlyLimit.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className={"h-full rounded-full transition-all duration-700 " + (featureGate.monthlyUsagePercent > 90 ? "bg-red-500" : featureGate.monthlyUsagePercent > 70 ? "bg-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500")}
                                                        style={{ width: \`\${Math.min(100, featureGate.monthlyUsagePercent)}%\` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {featureGate.monthlyLimit === Infinity ? "Unlimited sending" : \`\${Math.max(0, featureGate.monthlyLimit - featureGate.emailsSentThisMonth).toLocaleString()} emails remaining this month\`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Plan Comparison */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Available Plans</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className={\`text-sm font-medium \${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}\`}>Monthly</span>
                                                    <button
                                                        onClick={() => setIsYearly(!isYearly)}
                                                        className={\`relative w-11 h-6 rounded-full transition-colors \${isYearly ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}\`}
                                                    >
                                                        <div className={\`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform \${isYearly ? "translate-x-6" : "translate-x-1"}\`} />
                                                    </button>
                                                    <span className={\`text-sm font-medium \${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}\`}>
                                                        Yearly
                                                        <span className="ml-1 text-xs text-cyan-500 font-semibold">Save 17%</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {plans.map((plan) => {
                                                    const isCurrent = plan.id === currentPlan;
                                                    return (
                                                        <div
                                                            key={plan.id}
                                                            className={\`relative rounded-xl p-5 border transition-all \${isCurrent
                                                                ? "border-cyan-300 dark:border-cyan-700 bg-cyan-50/30 dark:bg-cyan-950/20 ring-1 ring-cyan-200/50 dark:ring-cyan-800/30"
                                                                : plan.featured
                                                                    ? "border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm"
                                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                                                                }\`}
                                                        >
                                                            {isCurrent && (
                                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-white text-[10px] font-bold tracking-wider rounded-full uppercase">
                                                                    Current
                                                                </div>
                                                            )}
                                                            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white tracking-[-0.02em]">{plan.name}</h3>
                                                            <p className="text-xs text-slate-400 mt-1 mb-4">{plan.description}</p>
                                                            <div className="mb-4">
                                                                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-white tracking-[-0.04em]">
                                                                    $\${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                                                </span>
                                                                <span className="text-xs text-slate-400 ml-1">/mo</span>
                                                            </div>
                                                            <button
                                                                className={\`w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] \${isCurrent
                                                                    ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default"
                                                                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-md hover:shadow-cyan-500/20"
                                                                    }\`}
                                                                disabled={isCurrent}
                                                            >
                                                                {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                                                            </button>
                                                            <ul className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                                                                {plan.features.map((feature, j) => (
                                                                    <li key={j} className="flex items-center gap-2">
                                                                        <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-xs text-slate-600 dark:text-slate-400">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Payment — Coming Soon */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Payment & Billing</h2>
                                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Coming Soon</span>
                                            </div>
                                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                </svg>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Stripe integration coming soon</p>
                                                <p className="text-xs text-slate-400 mt-1">Self-serve billing, invoices, and payment management will appear here</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeInContainer>
                </main>
            </PageTransition>
        </div>
    );
}

export default function SettingsPageWrapper() {
    return (
        <AuthGuard>
            <SettingsPage />
        </AuthGuard>
    );
}
\n`;

fs.writeFileSync('src/app/settings/page.tsx', goodLines + '\n' + tail);
console.log("Settings page successfully fixed.");
