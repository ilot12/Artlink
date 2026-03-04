import { motion } from 'framer-motion';

// 스플래시 스크린 - 앱 시작 시 1.5초간 로고 애니메이션
export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <motion.h1
          className="text-5xl font-bold text-gray-900 tracking-tight"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          ArtLink
        </motion.h1>
        <motion.div
          className="mt-3 h-0.5 bg-gray-900 mx-auto"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        <motion.p
          className="mt-3 text-sm text-gray-400 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          갤러리와 아티스트를 잇다
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
