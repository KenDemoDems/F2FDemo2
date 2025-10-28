import React from 'react';
import { Apple, Carrot, Fish, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import imgGeminiGeneratedImageTr9Lmtr9Lmtr9Lmt1 from "../../assets/fd3d181f9b03b45cb1db14a2f11330c6278969a7.png";
import { FloatingElement } from '../common/FloatingElement';

interface HeroSectionProps {
  onShowSignup?: () => void;
}

function HeroSection({ onShowSignup }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:floating-orb-1 rounded-full blur-3xl"
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
        ></motion.div>
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/30 dark:floating-orb-2 rounded-full blur-3xl"
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
        ></motion.div>
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-200/20 dark:floating-orb-3 rounded-full blur-2xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Apple className="absolute top-1/4 left-1/6 w-8 h-8 text-emerald-400/60" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Carrot className="absolute top-1/3 right-1/4 w-6 h-6 text-orange-400/60" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Fish className="absolute bottom-1/3 left-1/3 w-7 h-7 text-blue-400/60" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Scan Fridge.
                </span>
                <br />
                <span className="text-gray-800 dark:text-gray-100">Suggest Recipes.</span>
                <br />
                <span className="text-gray-700 dark:text-gray-200">Simplify Eating.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Transform your leftovers into delicious meals with our AI-powered recipe suggestions.
                Just snap a photo of your fridge and discover what you can cook today.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-emerald-500/30 text-gray-700 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-emerald-500/10 transition-colors"
                onClick={() => onShowSignup?.()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started!
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={imgGeminiGeneratedImageTr9Lmtr9Lmtr9Lmt1}
                alt="AI analyzing fridge contents"
                loading="lazy"
                className="w-full h-auto object-cover"
                style={{
                  mixBlendMode: 'multiply',
                  filter: 'contrast(1.1) brightness(1.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
