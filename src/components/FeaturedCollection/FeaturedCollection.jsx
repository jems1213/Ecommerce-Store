import { motion } from 'framer-motion';
import ShoeCard from '../ShoeCard/ShoeCard';
import './FeaturedCollection.css';

const FeaturedCollection = ({ title, shoes }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="featured-collection">
      <div className="container">
        <motion.div 
          className="collection-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="collection-title">{title}</h2>
          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="view-all"
          >
            View All →
          </motion.button>
        </motion.div>

        <motion.div
          className="shoe-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {Array.from(new Map((shoes || []).map(s => [s._id || s.id || Math.random(), s])).values()).map((shoe, idx) => (
            <motion.div
              key={shoe._id || shoe.id || `feat-${idx}`}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ShoeCard shoe={shoe} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
