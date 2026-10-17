import { Coins, Scissors, type LucideIcon } from "lucide-react";

export type Tool = {
    /** Sayfa adresi: /araclar/<slug> (dosya: app/araclar/<slug>/page.tsx) */
    slug: string;
    name: string;
    description: string;
    tags: string[];
    icon?: LucideIcon;
    /** Araç başka bir yerde çalışıyorsa tam adresi (ör. Hugging Face Space) */
    href?: string;
};

// Yeni bir araç eklemek için bu listeye kayıt ekle; Araçlar sayfası kendini günceller.
export const tools: Tool[] = [
    {
        slug: "chunk-gorsellestirici",
        name: "RAG Chunk Görselleştirici",
        description: "Metni farklı stratejilerle chunk'lara ayır; sınırları, boyutları ve overlap'leri renkli olarak gör.",
        tags: ["RAG", "Chunking", "Tarayıcıda çalışır"],
        icon: Scissors,
    },
    {
        slug: "token-sayaci",
        name: "Token Sayacı",
        description: "Metnin OpenAI tokenizer'larıyla kaç token tuttuğunu, token sınırlarını ve tahmini API maliyetini gör.",
        tags: ["Tokenizer", "Maliyet", "Tarayıcıda çalışır"],
        icon: Coins,
    },
];

export function toolHref(tool: Tool) {
    return tool.href ?? `/araclar/${tool.slug}`;
}

export function isExternalTool(tool: Tool) {
    return tool.href?.startsWith("http") ?? false;
}
