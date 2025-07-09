import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Briefcase, Award, Code, Server, Database, BrainCircuit, Cpu, Cloud, Lock, Zap } from 'lucide-react';

const About: React.FC = () => {
  const experienceData = [
    {
      title: "Senior Go Developer",
      company: "Walmart Global Tech",
      duration: "2023 - Present",
      description: "Leading development of cloud-native systems and microservices at global scale. Optimizing performance and implementing distributed systems solutions for one of the world's largest retailers.",
      icon: <Cloud />,
    },
    {
      title: "Lead Backend Engineer",
      company: "Siply",
      duration: "2022 - 2023",
      description: "Led end-to-end development of lending platform from 0 to ₹125 Crore disbursement in 8 months. Designed secure APIs, integrated NBFCs, and built advanced credit/authorization systems under tight deadlines.",
      icon: <Lock />,
    },
    {
      title: "Full Stack Developer",
      company: "SuperK",
      duration: "2020 - 2022",
      description: "Built and maintained full-stack applications using modern technologies. Developed scalable solutions for business requirements while ensuring optimal performance and user experience.",
      icon: <Cpu />,
    },
  ];

  const skills = {
    "Core Technologies": ["Go", "AWS", "Kubernetes", "Docker"],
    "System & Streaming": ["gRPC", "Kafka", "Microservices", "System Design"],
    "Database & Performance": ["SQL", "NoSQL", "Performance Optimization", "Database Design"],
    "Cloud & DevOps": ["Cloud Architecture", "CI/CD", "Infrastructure as Code", "Cost Optimization"],
  };

  const socialLinks = [
    {
      href: "mailto:karansinghkachwah@gmail.com",
      icon: <Mail className="w-5 h-5" />,
      label: "Email"
    },
    {
      href: "https://linkedin.com/in/karanskush",
      icon: <Linkedin className="w-5 h-5" />,
      label: "LinkedIn"
    }
  ];

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.3 } },
    out: { opacity: 0 }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    in: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative text-white">
      <div className="relative z-20">
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-16"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="flex flex-col md:flex-row items-start gap-12 mb-24">
            {/* Left side - Name and Intro */}
            <div className="w-full md:w-1/2">
              <div className="mb-8 relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 mx-auto md:mx-0 overflow-hidden shadow-xl">
                  <img
                    src="/images/karansingh.jpeg"
                    alt="Karan Singh"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/192x192";
                    }}
                  />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                Karan Singh
              </h1>
              {/* <h2 className="text-2xl md:text-3xl font-medium text-purple-400 mb-8">
                Scaling code to Cloud  
              </h2> */}
              <h2 className="text-2xl md:text-3xl font-medium text-purple-400 mb-8">
                Golang veteran, Full-Stack lead, Blockchain innovator, Cloud & Infra, AI integrator
              </h2>
              <div className="flex gap-4 mt-8">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right side - About Me */}
            <div className="w-full md:w-1/2 bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6">About Me</h3>
              <p className="text-lg text-gray-300 mb-6">
                Relentless builder and optimizer. I refactor, scale, and ship. Obsessed with squeezing every drop of performance from distributed systems and cloud platforms.
              </p>
              <p className="text-md text-gray-400 mb-6">
                Currently optimizing cloud-native systems at scale, leading Go-based refactoring and performance initiatives for platforms processing 2 Million+ daily transactions and driving $100M+ in annual savings. Architecting robust, production-ready microservices, implementing milli-core CPU optimizations, and building real-time streaming with gRPC and Kafka.
              </p>
              <p className="text-md text-gray-400 mb-6">
                Previously led the end-to-end development of a FinTech lending platform, launching from 0 to ₹125 Crore disbursed in 8 months. Designed secure APIs, integrated with NBFCs, and built advanced credit and authorization systems under tight deadlines.
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
          </motion.section>

          {/* Scroll Message */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8 -mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <span className="animate-bounce inline-block">↓</span>
              Scroll to see the Professional Journey
              <span className="animate-bounce inline-block">↓</span>
            </p>
          </motion.div>

          {/* Experience Timeline */}
          <motion.section variants={itemVariants} className="mb-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Professional Journey</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-700/50" />
              
              {experienceData.map((exp, index) => (
                <div key={index} className="relative flex items-center justify-between w-full mb-12">
                  <div className="w-5/12" /> {/* Empty space on the left */}
                  
                  <div className="w-10 h-10 rounded-full bg-purple-500 shadow-lg flex items-center justify-center text-white z-10">
                    {exp.icon}
                  </div>

                  <div className="w-5/12 text-left"> {/* Content always on the right */}
                    <motion.div variants={itemVariants}>
                      <p className="text-sm font-semibold text-purple-400 mb-1">{exp.duration}</p>
                      <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                      <p className="text-md font-medium text-gray-300">{exp.company}</p>
                      <p className="text-sm text-gray-400 mt-2">{exp.description}</p>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Skills Section */}
          <motion.section variants={itemVariants} className="mb-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Technical Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Object.entries(skills).map(([category, skillList]) => (
                <motion.div key={category} variants={itemVariants}>
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
                      <span key={skill} className="px-3 py-1 text-sm font-medium bg-gray-800/60 text-gray-300 rounded-full backdrop-blur-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>


          {/* Call to Action */}
          <motion.section variants={itemVariants} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Build Something Impactful</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm constantly building in this space and excited about the chance to collaborate with global teams on challenging technical problems.
            </p>
            <a
              href="mailto:karansinghkachwah@gmail.com"
              className="inline-flex items-center gap-3 px-8 py-3 rounded-xl text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105"
            >
              <span>Get in Touch</span>
              <Mail className="w-5 h-5" />
            </a>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 