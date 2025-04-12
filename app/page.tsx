'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaMedal, FaCode, FaRobot } from 'react-icons/fa';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center">
            {/* Profile Image with Glow Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Image
                src="/profile.jpg"
                alt="Yunus Emre Atalay"
                width={200}
                height={200}
                className="rounded-full border-4 border-white/10 shadow-2xl relative z-10"
                priority
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap z-20"
              >
                AI Developer
              </motion.div>
            </motion.div>

            {/* Name and Title with Gradient */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200"
            >
              {t.hero.title}
            </motion.h1>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-blue-200 mb-6"
            >
              {t.hero.role}
            </motion.h2>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-blue-100/80 max-w-2xl mb-8"
            >
              {t.hero.description}
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex space-x-6 mb-8"
            >
              {[
                { icon: FaGithub, href: "https://github.com/emreatalayy", label: "GitHub" },
                { icon: FaLinkedin, href: "https://www.linkedin.com/in/emreatalayy/", label: "LinkedIn" },
                { icon: FaEnvelope, href: "mailto:emreatalay852@gmail.com", label: "Email" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white transition-colors duration-300"
                >
                  <social.icon size={28} />
                </a>
              ))}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {[
                { icon: FaMedal, title: t.stats.awards, value: t.stats.awardCount },
                { icon: FaCode, title: t.stats.projects, value: t.stats.projectCount },
                { icon: FaRobot, title: t.stats.aiModels, value: t.stats.modelCount }
              ].map((stat) => (
                <div
                  key={stat.title}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center hover:bg-white/10 transition-colors duration-300"
                >
                  <stat.icon className="mx-auto mb-3 text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-white mb-1">{stat.title}</h3>
                  <p className="text-blue-200">{stat.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold text-white mb-4">{t.hero.techStack}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Python",
                  "TensorFlow",
                  "PyTorch",
                  "Computer Vision",
                  "NLP",
                  "Deep Learning",
                  "C++",
                  "C#"
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full text-blue-200 hover:bg-white/10 transition-colors duration-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/projects"
                className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition-all bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700"
              >
                <span className="relative text-white">{t.hero.cta}</span>
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-blue-200 rounded-full p-1">
            <div className="w-1.5 h-3 bg-blue-200 rounded-full animate-bounce mx-auto"></div>
          </div>
        </motion.div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t.skills.title}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t.skills.ai,
                description: t.skills.aiDesc,
                icon: "🤖"
              },
              {
                title: t.skills.dev,
                description: t.skills.devDesc,
                icon: "💻"
              },
              {
                title: t.skills.data,
                description: t.skills.dataDesc,
                icon: "📊"
              }
            ].map((skill, index) => (
              <motion.div
                key={skill.title}
                className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-4">{skill.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{skill.title}</h3>
                <p className="text-gray-600">{skill.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Achievements Section */}
      <section className="py-20 bg-gradient-to-b from-blue-900 to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-white"
          >
            {t.achievements.title}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: t.achievements.hackToFuture.title,
                description: t.achievements.hackToFuture.description,
                date: t.achievements.hackToFuture.date
              },
              {
                title: t.achievements.t3AI.title,
                description: t.achievements.t3AI.description,
                date: t.achievements.t3AI.date
              },
              {
                title: t.achievements.teknofest.title,
                description: t.achievements.teknofest.description,
                date: t.achievements.teknofest.date
              },
              {
                title: t.achievements.globalCeng.title,
                description: t.achievements.globalCeng.description,
                date: t.achievements.globalCeng.date
              }
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-blue-400 text-sm mb-2">{achievement.date}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{achievement.title}</h3>
                <p className="text-blue-200">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
