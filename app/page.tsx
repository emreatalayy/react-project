'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaTerminal, FaCode, FaMicrochip, FaFolderOpen, FaUserSecret } from 'react-icons/fa';
import BootSequence from './components/BootSequence';
import MatrixBackground from './components/MatrixBackground';
import TerminalWindow from './components/TerminalWindow';
import { cvData } from './data/cv';

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  return (
    <main className="min-h-screen relative p-4 md:p-8 font-mono text-[#00ff41] overflow-hidden">
      <MatrixBackground />
      <div className="scanline z-50 pointer-events-none"></div>

      {/* Header / Status Bar */}
      <header className="fixed top-0 left-0 w-full bg-black/80 border-b border-[#00ff41] z-40 px-4 py-2 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <FaTerminal className="text-[#00ff41]" />
          <span className="font-bold tracking-widest">YEA-OS v2.0.26</span>
        </div>
        <div className="text-xs md:text-sm">
          DURUM: <span className="text-[#00ff41] animate-pulse">ÇEVRİMİÇİ</span> | KULLANICI: MİSAFİR
        </div>
      </header>

      <div className="mt-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Left Sidebar - Navigation / Profile */}
        <div className="lg:col-span-3 space-y-6">
          <TerminalWindow title="KULLANICI_PROFİLİ" id="profile">
            <div className="flex flex-col items-center mb-4">
              <div className="w-32 h-32 rounded-full border-2 border-[#00ff41] overflow-hidden mb-4 relative group">
                <div className="absolute inset-0 bg-[#00ff41] opacity-20 group-hover:opacity-0 transition-opacity"></div>
                {/* Placeholder for profile image if needed, or keeping it digital */}
                <FaUserSecret className="w-full h-full p-4 text-[#00ff41]" />
              </div>
              <h1 className="text-xl font-bold text-center glitch" data-text={cvData.personal.name}>{cvData.personal.name}</h1>
              <p className="text-xs text-center text-[#00ff41]/80">{cvData.personal.title}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="border border-[#00ff41]/30 p-2 hover:bg-[#00ff41]/10 transition-colors cursor-pointer">
                <span className="text-[#00ff41]">{`>`} KONUM:</span> {cvData.personal.location}
              </div>
              <div className="border border-[#00ff41]/30 p-2 hover:bg-[#00ff41]/10 transition-colors cursor-pointer break-all">
                <span className="text-[#00ff41]">{`>`} E-POSTA:</span> {cvData.personal.email}
              </div>

              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-[#00ff41]/30">
                <a href={cvData.personal.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaGithub size={24} /></a>
                <a href={cvData.personal.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaLinkedin size={24} /></a>
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow title="SİSTEM_NAVİGASYON">
            <nav className="flex flex-col gap-2">
              {[
                { id: 'overview', label: 'GENEL_BAKIŞ', icon: FaMicrochip },
                { id: 'experience', label: 'DENEYİM_KAYITLARI', icon: FaTerminal },
                { id: 'projects', label: 'PROJE_DOSYALARI', icon: FaFolderOpen },
                { id: 'skills', label: 'YÜKLÜ_MODÜLLER', icon: FaCode },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 p-2 text-left transition-all duration-300 border ${activeTab === item.id ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'border-transparent hover:border-[#00ff41] hover:text-[#00ff41]'}`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {activeTab === item.id && <span className="ml-auto animate-pulse">_</span>}
                </button>
              ))}
            </nav>
          </TerminalWindow>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TerminalWindow title="BENİOKU.MD">
                  <div className="prose prose-invert max-w-none text-[#00ff41]">
                    <h2 className="text-xl font-bold border-b border-[#00ff41] pb-2 mb-4">
                      {`>`} SİSTEM_BAŞLATILDI
                    </h2>
                    <p className="mb-4">
                      Dijital çalışma alanıma hoş geldiniz. Yapay Zekâ ve Full Stack Geliştirme alanlarında uzmanlaşmış bir Bilgisayar Mühendisiyim.
                      Sistemim, ileri düzey algoritmalar kullanarak karmaşık problemleri çözmek için optimize edilmiştir.
                    </p>
                    <p>
                      Mevcut Hedef: Otonom ajanlar ve ölçeklenebilir yapay zekâ çözümleri geliştirmek.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <span className="bg-[#00ff41]/20 border border-[#00ff41] px-4 py-2 rounded">
                        Hedef: Yapay Zekâ Mühendisliği
                      </span>
                      <span className="bg-[#00ff41]/20 border border-[#00ff41] px-4 py-2 rounded">
                        Durum: Çalışıyorum
                      </span>
                    </div>
                  </div>
                </TerminalWindow>

                {/* Latest Achievement Highlight */}
                <TerminalWindow title="SON_BAŞARILAR">
                  <ul className="space-y-3">
                    {cvData.achievements.slice(0, 3).map((achievement, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <span className="text-2xl text-yellow-400 shrink-0">🏆</span>
                        <div>
                          <h3 className="text-sm font-bold">{achievement}</h3>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TerminalWindow>
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {cvData.experience.map((exp, index) => (
                  <TerminalWindow key={index} title={`LOG_${index + 1}_${exp.company.replace(/\s/g, '_').toUpperCase()}`}>
                    <div className="text-sm md:text-base">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <span className="font-bold text-lg text-[#00ff41]">{`>`} {exp.role}</span>
                        <span className="text-[#00ff41]/70">[{exp.date}]</span>
                      </div>
                      <div className="mb-2 text-[#00ff41]/80">@{exp.company} {exp.location ? `// ${exp.location}` : ''}</div>
                      <p className="opacity-90 leading-relaxed border-l-2 border-[#00ff41] pl-4">
                        {exp.description}
                      </p>
                    </div>
                  </TerminalWindow>
                ))}

                <div className="my-8 border-t border-dashed border-[#00ff41]/50 pt-4">
                  <h3 className="text-lg font-bold mb-4">{`>`} EĞİTİM_GEÇMİŞİ</h3>
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="mb-6 ml-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{edu.school}</span>
                        <span className="text-xs opacity-70">{edu.date}</span>
                      </div>
                      <div className="text-sm opacity-80">{edu.degree}</div>
                      <div className="text-xs opacity-60">GPA: {edu.gpa}</div>
                      {edu.details && <div className="text-xs mt-1 text-[#00ff41]/60">{edu.details}</div>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {cvData.projects.map((project, index) => (
                  <TerminalWindow key={index} title={`EXEC_${project.title.substring(0, 10)}...`} className="h-full">
                    <div className="h-full flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-white">{project.title}</h3>
                      <div className="text-xs opacity-50 mb-4">{project.date}</div>
                      <p className="text-sm opacity-80 flex-grow">
                        {project.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-[#00ff41]/20 flex justify-end">
                        <button className="text-xs border border-[#00ff41] px-2 py-1 hover:bg-[#00ff41] hover:text-black transition-colors">
                          ÇALIŞTIR
                        </button>
                      </div>
                    </div>
                  </TerminalWindow>
                ))}
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TerminalWindow title="YÜKLÜ_PAKETLER">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cvData.skills.map((skill, index) => (
                      <div key={index} className="group relative border border-[#00ff41]/30 p-3 hover:bg-[#00ff41]/10 transition-colors pointer-events-auto">
                        <div className="text-xs opacity-50 mb-1">pkg_{index.toString().padStart(3, '0')}</div>
                        <div className="font-bold">{skill}</div>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-[#00ff41] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                </TerminalWindow>

                <TerminalWindow title="BAŞARILAR_KAYDI">
                  <ul className="space-y-3">
                    {cvData.achievements.map((achievement, index) => (
                      <li key={index} className="flex gap-2 items-start text-sm hover:text-white transition-colors cursor-default">
                        <span className="text-[#00ff41] shrink-0">[{index.toString().padStart(2, '0')}]</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </TerminalWindow>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full text-center text-xs opacity-50 p-2 pointer-events-none z-40 bg-black/50">
        SİSTEM_ID: YEA-001 | GÜVENLİ_BAĞLANTI_KURULDU | {showCursor ? '_' : ' '}
      </footer>
    </main>
  );
}
