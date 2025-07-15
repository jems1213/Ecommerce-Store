import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import './Newsletter.css';

const Newsletter = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.section 
      className="newsletter"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="newsletter-content" variants={itemVariants}>
          <motion.div 
            className="newsletter-icon"
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring" }}
          >
            <FiMail size={48} />
          </motion.div>
          
          <motion.h2 variants={itemVariants}>Stay Updated</motion.h2>
          <motion.p variants={itemVariants}>
            Subscribe to our newsletter for the latest releases and exclusive offers
          </motion.p>
          
          <motion.form 
            className="newsletter-form"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <motion.input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              required
              whileFocus={{ 
                boxShadow: "0 0 0 2px var(--primary)" 
              }}
            />
            <motion.button
              type="submit"
              className="newsletter-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Newsletter;