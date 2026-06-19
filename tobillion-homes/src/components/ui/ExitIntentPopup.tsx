'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiDocumentText } from 'react-icons/hi';

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setShow(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
          >
            <button
              onClick={() => { setShow(false); setDismissed(true); }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiDocumentText className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                Free Nairobi Property Guide
              </h3>
              <p className="text-gray-500 mb-6">
                Get our comprehensive guide to buying property in Nairobi — includes neighborhood prices, legal steps, and expert tips.
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-gold-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  Get Free Guide
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-4">No spam. Unsubscribe anytime.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
