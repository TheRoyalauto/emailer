"use client";

import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuthGuard } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { PageLoadingSpinner } from "@/components/PageLoadingSpinner";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function BrandRulesPage() {
    return (
        <AuthGuard>
            <BrandRulesContent />
        </AuthGuard>
    );
}

function BrandRulesContent() {
    const [editingId, setEditingId] = useState<Id<"emailBrandRules"> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        isDefault: false,
        voiceDescription: "",
        voiceSamples: [] as string[],
        forbiddenPhrases: [] as string[],
        requiredPhrases: [] as string[],
        preferredPhrases: [] as string[],
        productFacts: [] as { fact: string; context?: string }[],
        maxParagraphs: 4,
        maxSubjectLength: 60,
        signatureTemplate: "",
        companyName: "",
        senderPersona: "",
    });
    const [newVoiceSample, setNewVoiceSample] = useState("");
    const [newForbidden, setNewForbidden] = useState("");
    const [newRequired, setNewRequired] = useState("");
    const [newPreferred, setNewPreferred] = useState("");
    const [newFact, setNewFact] = useState({ fact: "", context: "" });

    const rules = useAuthQuery(api.brandRules.list, {});
    const createRule = useAuthMutation(api.brandRules.create);
    const updateRule = useAuthMutation(api.brandRules.update);
    const deleteRule = useAuthMutation(api.brandRules.remove);

    const resetForm = () => {
        setFormData({
            name: "",
            isDefault: false,
            voiceDescription: "",
            voiceSamples: [],
            forbiddenPhrases: [],
            requiredPhrases: [],
            preferredPhrases: [],
            productFacts: [],
            maxParagraphs: 4,
            maxSubjectLength: 60,
            signatureTemplate: "",
            companyName: "",
            senderPersona: "",
        });
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (rule: NonNullable<typeof rules>[0]) => {
        setFormData({
            name: rule.name,
            isDefault: rule.isDefault || false,
            voiceDescription: rule.voiceDescription || "",
            voiceSamples: rule.voiceSamples || [],
            forbiddenPhrases: rule.forbiddenPhrases || [],
            requiredPhrases: rule.requiredPhrases || [],
            preferredPhrases: rule.preferredPhrases || [],
            productFacts: rule.productFacts || [],
            maxParagraphs: rule.maxParagraphs || 4,
            maxSubjectLength: rule.maxSubjectLength || 60,
            signatureTemplate: rule.signatureTemplate || "",
            companyName: rule.companyName || "",
            senderPersona: rule.senderPersona || "",
        });
        setEditingId(rule._id);
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!formData.name) return;

        if (editingId) {
            await updateRule({ id: editingId, ...formData });
        } else {
            await createRule(formData);
        }
        resetForm();
    };

    const handleDelete = async (id: Id<"emailBrandRules">) => {
        if (confirm("Delete this brand rule?")) {
            await deleteRule({ id });
        }
    };

    const addToArray = (key: keyof typeof formData, value: string) => {
        if (!value.trim()) return;
        const arr = formData[key] as string[];
        setFormData({ ...formData, [key]: [...arr, value.trim()] });
    };

    const removeFromArray = (key: keyof typeof formData, index: number) => {
        const arr = [...(formData[key] as string[])];
        arr.splice(index, 1);
        setFormData({ ...formData, [key]: arr });
    };

    const addProductFact = () => {
        if (!newFact.fact.trim()) return;
        setFormData({
            ...formData,
            productFacts: [...formData.productFacts, { fact: newFact.fact, context: newFact.context || undefined }],
        });
        setNewFact({ fact: "", context: "" });
    };

    const removeProductFact = (index: number) => {
        const facts = [...formData.productFacts];
        facts.splice(index, 1);
        setFormData({ ...formData, productFacts: facts });
    };

    return (
        <PageWrapper>
            <PageHeader
                title="Brand Rules"
                subtitle="Configure voice, tone, and content rules for AI-generated emails"
            >
                {!isCreating && !editingId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                        + New Brand Rule
                    </button>
                )}
            </PageHeader>

            {/* Form */}
            {(isCreating || editingId) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {editingId ? "Edit Brand Rule" : "Create Brand Rule"}
                        </h2>
                        <button onClick={resetForm} className="text-slate-500 hover:text-slate-900">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Rule Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Main Brand, Enterprise Outreach"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <label className="text-sm text-slate-700">Set as default</label>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Your company name"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Sender Persona</label>
                                <input
                                    type="text"
                                    value={formData.senderPersona}
                                    onChange={(e) => setFormData({ ...formData, senderPersona: e.target.value })}
                                    placeholder="e.g., Sales Director, Account Manager"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Voice Description</label>
                                <textarea
                                    value={formData.voiceDescription}
                                    onChange={(e) => setFormData({ ...formData, voiceDescription: e.target.value })}
                                    placeholder="Describe your brand's voice and tone..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Max Paragraphs</label>
                                    <input
                                        type="number"
                                        value={formData.maxParagraphs}
                                        onChange={(e) => setFormData({ ...formData, maxParagraphs: parseInt(e.target.value) || 4 })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Max Subject Length</label>
                                    <input
                                        type="number"
                                        value={formData.maxSubjectLength}
                                        onChange={(e) => setFormData({ ...formData, maxSubjectLength: parseInt(e.target.value) || 60 })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Signature Template</label>
                                <textarea
                                    value={formData.signatureTemplate}
                                    onChange={(e) => setFormData({ ...formData, signatureTemplate: e.target.value })}
                                    placeholder="Your email signature template..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                                />
                            </div>
                        </div>

                        {/* Arrays */}
                        <div className="space-y-4">
                            {/* Voice Samples */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Voice Samples</label>
                                <p className="text-xs text-slate-400 mb-2">Example emails that match your brand voice</p>
                                <div className="flex gap-2 mb-2">
                                    <textarea
                                        value={newVoiceSample}
                                        onChange={(e) => setNewVoiceSample(e.target.value)}
                                        placeholder="Paste an example email..."
                                        rows={2}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none text-sm"
                                    />
                                    <button
                                        onClick={() => { addToArray("voiceSamples", newVoiceSample); setNewVoiceSample(""); }}
                                        className="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {formData.voiceSamples.map((sample, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white rounded px-2 py-1">
                                            <span className="text-xs text-slate-700 flex-1 truncate">{sample.slice(0, 50)}...</span>
                                            <button onClick={() => removeFromArray("voiceSamples", i)} className="text-red-400 text-xs">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Forbidden Phrases */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">🚫 Forbidden Phrases</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newForbidden}
                                        onChange={(e) => setNewForbidden(e.target.value)}
                                        placeholder="e.g., synergy, circle back"
                                        onKeyDown={(e) => e.key === "Enter" && (addToArray("forbiddenPhrases", newForbidden), setNewForbidden(""))}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    />
                                    <button
                                        onClick={() => { addToArray("forbiddenPhrases", newForbidden); setNewForbidden(""); }}
                                        className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {formData.forbiddenPhrases.map((phrase, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                            {phrase}
                                            <button onClick={() => removeFromArray("forbiddenPhrases", i)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Required Phrases */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">✓ Required Phrases</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newRequired}
                                        onChange={(e) => setNewRequired(e.target.value)}
                                        placeholder="e.g., complimentary consultation"
                                        onKeyDown={(e) => e.key === "Enter" && (addToArray("requiredPhrases", newRequired), setNewRequired(""))}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    />
                                    <button
                                        onClick={() => { addToArray("requiredPhrases", newRequired); setNewRequired(""); }}
                                        className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {formData.requiredPhrases.map((phrase, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                            {phrase}
                                            <button onClick={() => removeFromArray("requiredPhrases", i)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Phrases */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">★ Preferred Phrases</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newPreferred}
                                        onChange={(e) => setNewPreferred(e.target.value)}
                                        placeholder="e.g., partner, solution"
                                        onKeyDown={(e) => e.key === "Enter" && (addToArray("preferredPhrases", newPreferred), setNewPreferred(""))}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    />
                                    <button
                                        onClick={() => { addToArray("preferredPhrases", newPreferred); setNewPreferred(""); }}
                                        className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {formData.preferredPhrases.map((phrase, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                            {phrase}
                                            <button onClick={() => removeFromArray("preferredPhrases", i)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Product Facts */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">📋 Product Facts</label>
                                <p className="text-xs text-slate-400 mb-2">Key facts AI should know about your product</p>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newFact.fact}
                                        onChange={(e) => setNewFact({ ...newFact, fact: e.target.value })}
                                        placeholder="Fact"
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newFact.context}
                                        onChange={(e) => setNewFact({ ...newFact, context: e.target.value })}
                                        placeholder="Context (optional)"
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    />
                                    <button
                                        onClick={addProductFact}
                                        className="px-3 py-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {formData.productFacts.map((fact, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-amber-500/10 rounded px-2 py-1">
                                            <span className="text-xs text-amber-400 font-medium">{fact.fact}</span>
                                            {fact.context && <span className="text-xs text-slate-500">({fact.context})</span>}
                                            <button onClick={() => removeProductFact(i)} className="text-red-400 text-xs ml-auto">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                        <button onClick={resetForm} className="px-4 py-2 text-slate-500 hover:text-slate-900">Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={!formData.name}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {editingId ? "Save Changes" : "Create Rule"}
                        </button>
                    </div>
                </div>
            )}

            {/* Rules List */}
            {!isCreating && !editingId && (
                <div className="grid gap-4">
                    {rules === undefined ? (
                        <PageLoadingSpinner />
                    ) : rules?.length === 0 ? (
                        <PageEmptyState
                            icon="🎨"
                            title="No Brand Rules Yet"
                            description="Create your first brand rule to guide AI-generated content"
                            actionLabel="+ Create Brand Rule"
                            onAction={() => setIsCreating(true)}
                            buttonClassName="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                        />
                    ) : (
                        <>
                            {rules?.map((rule) => (
                                <div key={rule._id} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-5 hover:border-slate-200 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{rule.name}</h3>
                                            {rule.isDefault && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">Default</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(rule)}
                                                className="px-3 py-1.5 text-slate-500 hover:text-slate-900 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rule._id)}
                                                className="px-3 py-1.5 text-red-400/70 hover:text-red-400 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {rule.voiceDescription && (
                                        <p className="text-slate-500 text-sm mb-3">{rule.voiceDescription}</p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        {rule.voiceSamples?.length ? (
                                            <span>📝 {rule.voiceSamples.length} voice samples</span>
                                        ) : null}
                                        {rule.forbiddenPhrases?.length ? (
                                            <span>🚫 {rule.forbiddenPhrases.length} forbidden</span>
                                        ) : null}
                                        {rule.requiredPhrases?.length ? (
                                            <span>✓ {rule.requiredPhrases.length} required</span>
                                        ) : null}
                                        {rule.productFacts?.length ? (
                                            <span>📋 {rule.productFacts.length} facts</span>
                                        ) : null}
                                        {rule.companyName && (
                                            <span>🏢 {rule.companyName}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </PageWrapper>
    );
}
