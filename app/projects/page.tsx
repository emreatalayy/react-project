'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types/project';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

export default function Projects() {
  const { t, language } = useLanguage();
  
  const projects: Project[] = [
    {
      id: '1',
      title: t.projects.datBot.title,
      description: t.projects.datBot.description,
      longDescription: t.projects.datBot.longDescription,
      technologies: ['Python', 'CNN', 'LSTM', 'RAG', 'LLM', 'TensorFlow', 'PyTorch'],
      imageUrl: '/dat-bot.jpg',
      githubUrl: 'https://github.com/username/dat-bot'
    },
    {
      id: '2',
      title: t.projects.healthAI.title,
      description: t.projects.healthAI.description,
      longDescription: t.projects.healthAI.longDescription,
      technologies: ['Python', 'Deep Learning', 'TensorFlow', 'OpenCV', 'Keras'],
      imageUrl: '/health-ai.jpg',
      githubUrl: 'https://github.com/username/health-ai'
    },
    {
      id: '3',
      title: t.projects.llmProject.title,
      description: t.projects.llmProject.description,
      longDescription: t.projects.llmProject.longDescription,
      technologies: ['Python', 'LLM', 'NLP', 'Transformers', 'PyTorch'],
      imageUrl: '/llm-project.jpg',
      githubUrl: 'https://github.com/username/llm-project'
    },
    {
      id: '4',
      title: t.projects.fintech.title,
      description: t.projects.fintech.description,
      longDescription: t.projects.fintech.longDescription,
      technologies: ['Python', 'AI', 'FinTech', 'Machine Learning'],
      imageUrl: '/fintech.jpg',
      githubUrl: 'https://github.com/username/fintech-solution'
    },
    {
      id: '5',
      title: t.projects.defense.title,
      description: t.projects.defense.description,
      longDescription: t.projects.defense.longDescription,
      technologies: ['Python', 'C++', 'Computer Vision', 'Real-time Systems'],
      imageUrl: '/defense.jpg',
      githubUrl: 'https://github.com/username/air-defense'
    },
    {
      id: '6',
      title: t.projects.transport.title,
      description: t.projects.transport.description,
      longDescription: t.projects.transport.longDescription,
      technologies: ['Python', 'Computer Vision', 'TensorFlow', 'IoT'],
      imageUrl: '/transport-ai.jpg',
      githubUrl: 'https://github.com/username/transport-ai'
    }
  ];

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.technologies.includes(filter));

  const uniqueTechnologies = Array.from(
    new Set(projects.flatMap(p => p.technologies))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.h1 
          className="text-4xl font-bold text-center mb-6 gradient-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.projects.title}
        </motion.h1>

        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t.projects.filterAll}
          </button>
          {uniqueTechnologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setFilter(tech)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tech 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tech}
            </button>
          ))}
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              onClick={() => setSelectedProject(project)}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 relative overflow-hidden">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error(`Resim yüklenemedi: ${project.imageUrl}`);
                    const target = e.currentTarget.parentElement;
                    if (target) {
                      target.innerHTML = `
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl">
                          ${project.title.charAt(0)}
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedProject && (
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            >
              <motion.div 
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      console.error(`Resim yüklenemedi: ${selectedProject.imageUrl}`);
                      const target = e.currentTarget.parentElement;
                      if (target) {
                        target.innerHTML = `
                          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl">
                            ${selectedProject.title.charAt(0)}
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedProject.title}
                    </h2>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{selectedProject.longDescription}</p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
} 