import { Bot, BrainCircuit, DatabaseZap, MessageSquareText, ScanEye, ScanSearch, Workflow } from "lucide-react";
import {
    siCplusplus,
    siDocker,
    siFastapi,
    siGit,
    siKeras,
    siLangchain,
    siN8n,
    siNextdotjs,
    siNodedotjs,
    siNumpy,
    siOpencv,
    siPandas,
    siPython,
    siPytorch,
    siReact,
    siScikitlearn,
    siSupabase,
    siTensorflow,
    siTypescript,
} from "simple-icons";

type Tech = { name: string; icon?: { path: string; hex: string } };

export const cvData = {
    name: "Yunus Emre Atalay",
    title: "Bilgisayar Mühendisi",
    bio: "Merhaba, ben Emre. Doğal dil işleme, büyük dil modelleri ve yapay zekâ ajanları üzerine çalışıyorum. Bugünlerde çoğunlukla RAG tabanlı sistemler ve otomasyon projeleri geliştiriyorum.",
    email: "emreatalay852@gmail.com",
    social: {
        github: { url: "https://github.com/emreatalayy", handle: "@emreatalayy" },
        linkedin: { url: "https://www.linkedin.com/in/emreatalayy/", handle: "in/emreatalayy" },
    },
    current: {
        company: "Zephlex Finansal Teknolojiler",
        role: "Yapay Zekâ Mühendisi · Uzaktan",
        since: "Aralık 2025'ten beri",
    },
    location: {
        city: "İstanbul",
        timeZone: "Europe/Istanbul",
    },
    education: {
        school: "Karadeniz Teknik Üniversitesi",
        department: "Bilgisayar Mühendisliği",
        degrees: [
            { level: "Yüksek lisans", status: "2025 – 2026" },
            { level: "Lisans", status: "2019 – 2024" },
        ],
    },
    focus: [
        { label: "Doğal Dil İşleme", icon: MessageSquareText },
        { label: "Büyük Dil Modelleri", icon: BrainCircuit },
        { label: "RAG", icon: DatabaseZap },
        { label: "Yapay Zekâ Ajanları", icon: Bot },
        { label: "Açıklanabilir YZ", icon: ScanSearch },
        { label: "Görüntü İşleme", icon: ScanEye },
        { label: "Otomasyon", icon: Workflow },
    ],
    stack: [
        [
            { name: "Python", icon: siPython },
            { name: "PyTorch", icon: siPytorch },
            { name: "TensorFlow", icon: siTensorflow },
            { name: "Keras", icon: siKeras },
            { name: "scikit-learn", icon: siScikitlearn },
            { name: "LangChain", icon: siLangchain },
            { name: "OpenCV", icon: siOpencv },
            { name: "NumPy", icon: siNumpy },
            { name: "Pandas", icon: siPandas },
        ],
        [
            { name: "TypeScript", icon: siTypescript },
            { name: "React", icon: siReact },
            { name: "Next.js", icon: siNextdotjs },
            { name: "FastAPI", icon: siFastapi },
            { name: "Node.js", icon: siNodedotjs },
            { name: "n8n", icon: siN8n },
            { name: "Supabase", icon: siSupabase },
            { name: "Docker", icon: siDocker },
            { name: "Git", icon: siGit },
            { name: "C/C++", icon: siCplusplus },
            { name: "C#" },
        ],
    ] satisfies Tech[][],
};
