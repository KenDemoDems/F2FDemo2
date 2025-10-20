import React from 'react';
import { Trash2, RotateCcw, Recycle, Award, Apple, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface SDG12SectionProps {
  onShowLogin?: () => void;
  onShowSignup?: () => void;
}

function SDG12Section({ onShowLogin, onShowSignup }: SDG12SectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(34,197,94) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Decorative Graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 opacity-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Recycle className="w-24 h-24 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 opacity-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Award className="w-16 h-16 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 opacity-10"
          animate={{
            rotate: [45, 65, 45],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Apple className="w-20 h-20 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-1/4 opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-18 h-18 text-green-600" />
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main SDG12 Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Award className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Supporting SDG 12
            </h2>
            <motion.div
              animate={{
                rotate: [0, -360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Recycle className="w-12 h-12 text-green-600" />
            </motion.div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Responsible Consumption and Production
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FridgeToFork is committed to ensuring sustainable consumption and production patterns
            by transforming how households manage food resources.
          </p>
        </div>

        {/* How We Support SDG12 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Food Waste Reduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:glass border-0 dark:border dark:border-emerald-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Trash2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Reduce Food Waste
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our AI helps you use existing ingredients before they spoil, reducing the
                  1.3 billion tons of food wasted globally each year.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Smart Resource Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-teal-50 to-green-50 dark:glass border-0 dark:border dark:border-teal-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <RotateCcw className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Smart Resource Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Optimize ingredient usage through intelligent recipe suggestions that maximize
                  value from every item in your fridge.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sustainable Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:glass border-0 dark:border dark:border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Recycle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Sustainable Habits
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Foster conscious consumption patterns through meal planning and inventory
                  management that benefits both families and the environment.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>


        {/* Call to Action */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Join the Movement for Sustainable Consumption
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Every meal you optimize contributes to a more sustainable future.
              Start making a difference today with FridgeToFork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 dark:emerald-gradient dark:hover:brightness-110 text-white transform hover:scale-105 transition-all px-8 py-3"
                onClick={() => onShowSignup?.()}
              >
                <Heart className="w-5 h-5 mr-2" />
                Start Your Sustainable Journey
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-8 py-3"
                onClick={() => window.open('https://globalgoals.org/goals/12-responsible-consumption-and-production/', '_blank')}
              >
                <Award className="w-5 h-5 mr-2" />
                Learn More About SDG 12
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SDG12Section;
