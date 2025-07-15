import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './SizeGuide.css';

const SizeGuide = ({ onClose }) => {
  const sizeChart = {
    "US Men": ["6", "7", "8", "9", "10", "11", "12"],
    "US Women": ["5", "6", "7", "8", "9", "10", "11"],
    "EU": ["38", "39", "40", "41", "42", "43", "44"],
    "UK": ["5", "6", "7", "8", "9", "10", "11"],
    "CM": ["24", "25", "26", "27", "28", "29", "30"]
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="size-guide-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="size-guide-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="size-guide-header">
            <h2>Size Guide</h2>
            <motion.button 
              onClick={onClose}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="close-btn"
            >
              <FiX />
            </motion.button>
          </div>
          
          <motion.div 
            className="size-table-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {Object.keys(sizeChart).map(sizeType => (
                    <th key={sizeType}>{sizeType}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 7 }).map((_, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <td>{index + 1}</td>
                    {Object.values(sizeChart).map((sizes, i) => (
                      <td key={i}>{sizes[index]}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          
          <motion.div 
            className="measurement-guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>How to measure your foot:</h3>
            <ol>
              <motion.li
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Place your foot on a piece of paper
              </motion.li>
              <motion.li
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Mark the longest part of your foot (heel to toe)
              </motion.li>
              <motion.li
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Measure the distance between the marks
              </motion.li>
              <motion.li
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Compare with our size chart
              </motion.li>
            </ol>
            <motion.div 
              className="foot-measurement-image"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {/* Measurement diagram would go here */}
              <div className="measurement-diagram" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeGuide;