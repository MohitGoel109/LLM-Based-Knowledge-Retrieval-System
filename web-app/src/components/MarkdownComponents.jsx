const mdComponents = {
    h1: ({ node, ...props }) => (
        <h1 className="text-2xl font-bold mt-6 mb-3 tracking-tight text-[var(--accent)]" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-xl font-bold mt-5 mb-3 tracking-tight text-[var(--text-heading)]" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-lg font-semibold mt-4 mb-2 text-[var(--text-heading)]" {...props} />
    ),
    p: ({ node, ...props }) => (
        <p className="leading-relaxed mb-4 text-[16px] text-[var(--text-primary)]" {...props} />
    ),
    ul: ({ node, ...props }) => (
        <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-[var(--text-primary)]" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-[var(--text-primary)]" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="pl-1 leading-relaxed" {...props} />
    ),
    table: ({ node, ...props }) => (
        <div className="overflow-x-auto my-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <table className="text-[15px] text-left w-full whitespace-nowrap" {...props} />
        </div>
    ),
    th: ({ node, ...props }) => (
        <th className="p-4 font-bold text-xs uppercase tracking-widest bg-[var(--bg-surface)] text-[var(--accent)] border-b border-[var(--border-default)]" {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className="p-4 border-b border-[var(--border-subtle)] text-[var(--text-primary)]" {...props} />
    ),
    a: ({ node, ...props }) => (
        <a className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold underline underline-offset-4 transition-colors" {...props} />
    ),
    strong: ({ node, ...props }) => (
        <strong className="font-bold text-[var(--text-heading)]" {...props} />
    ),
    pre: ({ node, children, ...props }) => (
        <pre className="p-5 rounded-2xl overflow-x-auto text-[14px] font-mono mb-4 bg-[#0a0a12] border border-[var(--border-subtle)] text-[#93c5fd]" {...props}>
            {children}
        </pre>
    ),
    code: ({ node, className, children, ...props }) => {
        // Fenced code blocks have a language className and are wrapped in <pre>
        if (className) {
            return <code className={className} {...props}>{children}</code>;
        }
        return (
            <code className="px-2 py-1 rounded-lg text-[14px] font-mono bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-default)]" {...props}>{children}</code>
        );
    },
};

export default mdComponents;
