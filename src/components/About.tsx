import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Briefcase, Award, Code, Server, Database, BrainCircuit, Cpu, Cloud, Lock, Zap, FileText } from 'lucide-react';
import { FintechBackground } from './ui/fintech-background';

const About: React.FC = () => {
  // Animated code snippet state
  const codeRef = useRef<HTMLPreElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const codeSnippet = `
func LoadAmazingDeveloper(ctx context.Context) (*Developer, error) {
    // Initialize developer with maximum power level
    dev := &Developer{
        Name:     "Karan",
        PowerLevel: 9001, // It's over 9000!
        Skills: []string{
            "Golang Sorcery",
            "Cloud Whispering",
            "Blockchain Architect",
            "AI Integrator",
            "Backend Wizardry",
            "Performance Magic",
        },
        CoffeeLevel: 100,
        BugCount:    0, // Perfectly balanced, as all things should be
    }

    // Apply special abilities
    if err := dev.LearnNewTricks(ctx); err != nil {
        set BugCount == 0
        return nil, fmt.Errorf("failed to level up: %w", err)
    }

    // Quick power nap for optimal performance
    time.Sleep(100 * time.Millisecond)
    
    return dev, nil
}`.trim();

  useEffect(() => {
    let currentChar = 0;
    let isTyping = true;

    const typeCode = () => {
      if (!codeRef.current) return;
      
      if (isTyping && currentChar < codeSnippet.length) {
        codeRef.current.textContent = codeSnippet.slice(0, currentChar + 1);
        currentChar++;
      } else {
        isTyping = false;
        currentChar = 0;
      }

      if (!isTyping && currentChar === 0) {
        isTyping = true;
        setTimeout(typeCode, 2000); // Pause before restarting
      } else {
        setTimeout(typeCode, isTyping ? 50 : 30);
      }
    };

    typeCode();
  }, []);

  // Cursor blink effect
  useEffect(() => {
    if (!cursorRef.current) return;
    const cursor = cursorRef.current;
    
    const blinkInterval = setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 530);

    return () => clearInterval(blinkInterval);
  }, []);

  const experienceData = [
    {
      title: "SE3(Golang)",
      company: "Walmart Global Tech",
      duration: "Nov 2022 - Present",
      description: "Re-architected Walmart's algo engine handling 130K orders/day, boosting pick rates and saving $100M+ across 4500 stores.\n\nBuilt a Go-based messaging proxy, real-time gRPC streams, and milli-core infra optimizations, saving $1.3M annually.\n\nLed major cost and performance wins across Kafka, database auth, and multi-DC onboarding with 20% logistics efficiency gain.",
      icon: <Cloud />,
    },
    {
      title: "Lead Backend Engineer",
      company: "Siply",
      duration: "May 2021 - Nov 2022",
      description: "Launched a ₹125 Cr+ lending platform integrating NBFCs & EWA products, improving credit access across partners.\n\nEngineered an internal credit scoring system and JWT-based state-less auth with rotational token security.",
      icon: <Lock />,
    },
    {
      title: "Full Stack Developer",
      company: "SuperK",
      duration: "March 2020 - May 2021",
      description: "Built ERP-integrated full-stack tools using React, Vue, Node, and Python to streamline supply chain ops.\n\nLed data automation via GCP, BigQuery, and CRON pipelines for FMCG intelligence and ops visibility.",
      icon: <Cpu />,
    },
  ];

  const skills = {
    "Programming & Core": ["Go", "Java", "Python", "C", "System Design"],
    "Database & Data": ["MySQL", "SQLServer", "AzureSQL", "NoSQL", "Redis", "Kafka", "Prometheus", "Grafana", "AVRO"],
    "Web & API": ["ReactJS", "Redux", "VueJS", "NodeJS", "REST", "Swagger", "Bootstrap"],
    "Cloud & DevOps": ["AWS", "Kubernetes", "Docker", "CI/CD", "Infrastructure as Code"],
    "AI & Blockchain": ["NLP", "Neural Networks", "CNN", "RNN", "IPFS", "EtherJS", "WebJS", "Smart Contracts"]
  };

  return (
    <div className="relative min-h-screen bg-[#0E0E11] text-white overflow-hidden">
      <FintechBackground
        primaryColor="0, 149, 255"
        secondaryColor="147, 51, 234"
        accentColor="0, 255, 163"
        particleCount={40}
        enableGrid={true}
        enableGradient={true}
      />

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-start gap-12 mb-24">
            {/* Left Column - Text and Code */}
            <div className="w-full lg:w-1/2 space-y-8">
              {/* Intro Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="font-mono leading-tight">
                  <span className="block text-4xl md:text-5xl lg:text-6xl font-bold">Hi, I'm Karan</span>
                  <span className="block text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 text-transparent bg-clip-text">
                    Golang veteran, Full-Stack lead, Blockchain innovator, Cloud & Infra, AI integrator
                  </span>
                </h1>
              </motion.div>

              {/* Animated Code Snippet */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
                  </div>
                  <pre className="font-mono text-xs text-green-400">
                    <code ref={codeRef}></code>
                    <span ref={cursorRef} className="inline-block w-1.5 h-3 bg-green-400 ml-1"></span>
                  </pre>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex gap-4"
              >
                <a
                  href="mailto:karansinghkachwah@gmail.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </a>
                <a
                  href="https://linkedin.com/in/karanskush"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://drive.google.com/file/d/12VVCIMGVIGaOGtYoI_nLCAn_JYgUiaqC/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <FileText className="w-5 h-5" />
                  <span>Resume</span>
                </a>
                <a
                  href="https://ieeexplore.ieee.org/document/8674919"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <BrainCircuit className="w-5 h-5" />
                  <span>Research</span>
                </a>
              </motion.div>
            </div>

            {/* Right Column - About Me */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-full lg:w-1/2"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">About Me</h3>
                <p className="text-lg text-gray-300 mb-6">
                  Relentless builder and optimizer. I refactor, scale, and ship. Obsessed with squeezing every drop of performance from distributed systems and cloud platforms.
                </p>
                <p className="text-md text-gray-400 mb-6">
                Currently, at Walmart Global Tech I havee been optimizing cloud-native systems at scale, leading Go-based refactoring and performance initiatives for algo engine processing 2 Million+ daily transactions and driving $100M+ in annual savings last year. <br/>This includes Architecting robust, production-ready microservices, implementing milli-core CPU optimizations, and building real-time streaming with gRPC and Kafka.
                </p>
                <p className="text-md text-gray-400 mb-6">
                Previously led the end-to-end development of a FinTech lending platform, launching from 0 to ₹125 Crore disbursed in 8 months. Designed secure APIs, integrated with NBFCs, and built advanced credit and authorization systems under tight deadlines.
                  <a href="https://www.thehindu.com/business/siply-claims-zero-npa-disburses-loans-of-over-125-crore/article65342118.ece" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-400 hover:text-blue-300 ml-1 underline">
                    [Read more]
                  </a>
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Weekend Optimizer</h4>
                    <p className="text-md text-gray-400">
                      Always experimenting with new tech, recent hacks include AI based Infra optimization, automated CI/CD pipelines for blockchain deployment & microservice observability tools.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Experience Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Professional Journey</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-700/50" />
              
              {experienceData.map((exp, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                  key={index}
                  className="relative flex items-center justify-between w-full mb-8"
                >
                  {index % 2 === 1 ? (
                    // Left side content for odd indices (Siply)
                    <div className="w-5/12 text-right bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
                      <p className="text-sm font-semibold text-purple-400 mb-1">{exp.duration}</p>
                      <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                      <p className="text-md font-medium text-gray-300">{exp.company}</p>
                      <p className="text-sm text-gray-400 mt-2 whitespace-pre-line">{exp.description}</p>
                    </div>
                  ) : (
                    // Empty space for even indices
                    <div className="w-5/12" />
                  )}
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-white z-10">
                    {exp.icon}
                  </div>

                  {index % 2 === 0 ? (
                    // Right side content for even indices (Walmart, SuperK)
                    <div className="w-5/12 text-left bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30">
                      <p className="text-sm font-semibold text-purple-400 mb-1">{exp.duration}</p>
                      <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                      <p className="text-md font-medium text-gray-300">{exp.company}</p>
                      <p className="text-sm text-gray-400 mt-2 whitespace-pre-line">{exp.description}</p>
                    </div>
                  ) : (
                    // Empty space for odd indices
                    <div className="w-5/12" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Skills Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Technical Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Object.entries(skills).map(([category, skillList], index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                  key={category}
                  className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-800/50 rounded-lg mr-3">
                      {category.includes("Core") && <Zap className="w-5 h-5 text-purple-400"/>}
                      {category.includes("System") && <Server className="w-5 h-5 text-purple-400"/>}
                      {category.includes("Database") && <Database className="w-5 h-5 text-purple-400"/>}
                      {category.includes("Cloud") && <Cloud className="w-5 h-5 text-purple-400"/>}
                    </div>
                    <h3 className="text-xl font-semibold">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map(skill => (
                      <span key={skill} className="px-3 py-1 text-sm font-medium bg-gray-800/60 text-gray-300 rounded-full backdrop-blur-sm border border-gray-700/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Build Something Impactful</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm constantly building in this space and excited about the chance to collaborate with global teams on challenging technical problems.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:karansinghkachwah@gmail.com"
                className="inline-flex items-center gap-3 px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300 transform hover:scale-105"
              >
                <span>Get in Touch</span>
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://drive.google.com/file/d/12VVCIMGVIGaOGtYoI_nLCAn_JYgUiaqC/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3 rounded-xl text-lg font-semibold bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/30 text-white transition-all duration-300 transform hover:scale-105"
              >
                <span>View Resume</span>
                <FileText className="w-5 h-5" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default About; 