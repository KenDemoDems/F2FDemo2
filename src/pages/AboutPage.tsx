import React from 'react';
import { Heart, Star, Award, ArrowLeft, ChefHat, Camera, Recycle, Linkedin, Github, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FloatingElement } from '../components/common/FloatingElement';

interface Developer {
  name: string;
  role: string;
  description: string;
  avatar: string;
  email: string;
  github: string;
  linkedin: string;
}

interface AuthState {
  user: any;
  isLoggedIn: boolean;
}

interface AboutPageProps {
  auth?: AuthState;
  onNavigate?: (page: string) => void;
}

function AboutPage({ auth, onNavigate }: AboutPageProps) {
  const developers: Developer[] = [
    {
      name: "Miles S. Calledo",
      role: "Backend Developer",
      description: "Integrates reliable server systems to process images, store recipes, and ensure secure, efficient performance.",
      avatar: "MC",
      email: "milescalledo@gmail.com",
      github: "https://github.com/c-selim",
      linkedin: "https://www.linkedin.com/in/miles-calledo-8452751b2"
    },
    {
      name: "James Basti S. Igcalinos",
      role: "Full-Stack Developer & UX Designer",
      description: "Focuses on creating seamless user experiences and beautiful interfaces.",
      avatar: "JI",
      email: "jamessigcalinos@su.edu.ph",
      github: "https://github.com/jamesbasti",
      linkedin: "https://www.linkedin.com/in/james-basti-igcalinos-5826aa38b"
    },
    {
      name: "Krishnan V. Mahinay",
      role: "Lead Developer & AI Specialist",
      description: "Integrates AI models to analyze food images and generate creative, accurate recipes based on user uploads.",
      avatar: "KM",
      email: "kin3.mahinay@gmail.com",
      github: "https://github.com/kerokenn",
      linkedin: "https://www.linkedin.com/in/krishnan-mahinay"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Heart className="absolute top-1/4 left-1/6 w-6 h-6 text-emerald-400/40" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Star className="absolute top-1/3 right-1/4 w-5 h-5 text-teal-400/40" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Award className="absolute bottom-1/3 left-1/3 w-6 h-6 text-orange-400/40" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.(auth?.isLoggedIn ? 'home' : 'home')}
            className="hover:bg-emerald-50 text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {auth?.isLoggedIn ? 'Home' : 'Landing'}
          </Button>
        </div>

        {/* About Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                About FridgeToFork
              </span>
            </h1>

            <div className="flex items-center justify-center space-x-3 mb-8">
              <ChefHat className="w-12 h-12 text-emerald-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FridgeToFork
              </span>
            </div>
          </motion.div>
        </div>

        {/* App Information */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  FridgeToFork transforms the way you cook by turning your available ingredients into delicious meals.
                  Using advanced AI technology, we analyze your fridge contents and suggest personalized recipes that
                  minimize food waste while maximizing flavor.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our platform makes meal planning effortless, helps you discover new recipes, and encourages
                  sustainable cooking practices. From busy families to cooking enthusiasts, FridgeToFork adapts
                  to your lifestyle and dietary preferences.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                  <p className="text-emerald-800 leading-relaxed">
                    <strong>Supporting SDG 12:</strong> We're committed to ensuring sustainable consumption and production patterns
                    by helping households reduce food waste, optimize ingredient usage, and make more conscious cooking decisions
                    that benefit both families and the environment.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg">
                  <Camera className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Scanning</h3>
                    <p className="text-sm text-gray-600">AI-powered ingredient detection</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                  <ChefHat className="w-8 h-8 text-teal-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Recipe Suggestions</h3>
                    <p className="text-sm text-gray-600">Personalized meal recommendations</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <Recycle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Waste Reduction</h3>
                    <p className="text-sm text-gray-600">Minimize food waste effectively</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Team */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {developers.map((developer, index) => (
              <motion.div
                key={developer.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="group"
              >
                <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0 transition-all duration-300 group-hover:shadow-xl group-hover:bg-emerald-50/80 h-[400px] w-full">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                        <span className="text-white font-bold text-lg">
                          {developer.avatar}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">{developer.name}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700 mb-3 group-hover:bg-emerald-200 transition-colors duration-300">
                        {developer.role}
                      </Badge>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300 flex-1">
                        {developer.description}
                      </p>
                    </div>

                    {/* Social Links - Always visible with hover effects */}
                    <div className="pt-4 border-t border-gray-200 group-hover:border-emerald-200 transition-colors duration-300">
                      <div className="flex justify-center items-center space-x-3">
                        {/* LinkedIn */}
                        <a
                          href={developer.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>

                        {/* GitHub */}
                        <a
                          href={developer.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Github className="w-4 h-4 text-gray-600" />
                        </a>

                        {/* Email */}
                        <a
                          href={`mailto:${developer.email}`}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Mail className="w-4 h-4 text-red-600" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Features Section */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Why Choose FridgeToFork?
              </span>
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-center">
              Discover the features that make meal planning effortless and sustainable.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300"
              >
                <Camera className="w-10 h-10 text-emerald-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">AI-Powered Recognition</h4>
                <p className="text-sm text-gray-600">
                  Upload a photo and let our advanced AI identify ingredients instantly with high accuracy.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-100 hover:border-teal-300 transition-all duration-300"
              >
                <ChefHat className="w-10 h-10 text-teal-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Smart Recipe Generation</h4>
                <p className="text-sm text-gray-600">
                  Get personalized recipe suggestions based on what you have, complete with instructions and nutrition info.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300"
              >
                <Recycle className="w-10 h-10 text-green-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Zero Waste Approach</h4>
                <p className="text-sm text-gray-600">
                  Track expiry dates, reduce food waste, and contribute to a more sustainable future with every meal.
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AboutPage;
