import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HelpCenter.css';
import { 
  FiMail, 
  FiPhone, 
  FiMessageSquare, 
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiHelpCircle,
  FiSearch
} from 'react-icons/fi';

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [openQuestion, setOpenQuestion] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const chatEndRef = useRef(null);
  const formRef = useRef(null);

  // FAQ data
  const faqCategories = [
    {
      name: 'Orders & Shipping',
      questions: [
        {
          question: 'How can I track my order?',
          answer: 'You can track your order by clicking the tracking link in your shipping confirmation email or by logging into your account and viewing your order history. Tracking information is typically available within 24-48 hours after your order has shipped.'
        },
        {
          question: 'What are your shipping options?',
          answer: 'We offer standard shipping (3-5 business days), expedited shipping (2-3 business days), and express shipping (1-2 business days). Shipping costs vary based on the method selected and your location.'
        },
        {
          question: 'Can I change my shipping address after ordering?',
          answer: 'Address changes can only be made if the order hasn\'t been processed for shipping yet. Please contact our customer service immediately if you need to change your shipping address.'
        }
      ]
    },
    {
      name: 'Returns & Exchanges',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase. Items must be unworn, in original condition with tags attached. Final sale items cannot be returned. Refunds will be issued to the original payment method.'
        },
        {
          question: 'How do I initiate a return?',
          answer: 'You can initiate a return by logging into your account and accessing your order history. Select the item(s) you wish to return and follow the instructions. You\'ll receive a prepaid return label if applicable.'
        },
        {
          question: 'How long do refunds take to process?',
          answer: 'Once we receive your return, processing typically takes 3-5 business days. Your bank may take additional 3-5 business days to post the credit to your account.'
        }
      ]
    },
    {
      name: 'Product Information',
      questions: [
        {
          question: 'How do I determine my size?',
          answer: 'We provide detailed size charts for each product. Measure yourself according to the instructions and compare with our size chart. If you\'re between sizes, we recommend sizing up for a more comfortable fit.'
        },
        {
          question: 'Are your products ethically sourced?',
          answer: 'Yes, we partner with manufacturers who adhere to strict ethical standards. All our products are made in facilities that provide fair wages and safe working conditions.'
        },
        {
          question: 'How do I care for my sneakers?',
          answer: 'For most sneakers, we recommend spot cleaning with a mild detergent and soft brush. Allow them to air dry naturally. Avoid machine washing unless specifically noted in the product care instructions.'
        }
      ]
    }
  ];

  // Resources
  const resources = [
    {
      title: 'Size Guide',
      description: 'Comprehensive guide to finding your perfect fit',
      link: '/size-guide'
    },
    {
      title: 'Care Instructions',
      description: 'How to maintain and clean your sneakers',
      link: '/care-instructions'
    },
    {
      title: 'Shipping Information',
      description: 'Details about our shipping methods and timelines',
      link: '/shipping-info'
    },
    {
      title: 'Return Policy',
      description: 'Complete details about our return process',
      link: '/return-policy'
    }
  ];

  // Contact information
  const contactInfo = [
    {
      icon: <FiMail />,
      title: 'Email Us',
      detail: 'support@sneakerhub.com',
      action: 'mailto:support@sneakerhub.com'
    },
    {
      icon: <FiPhone />,
      title: 'Call Us',
      detail: '+1 (800) 555-1234',
      action: 'tel:+18005551234'
    },
    {
      icon: <FiClock />,
      title: 'Hours',
      detail: 'Mon-Fri: 9AM-6PM EST\nSat: 10AM-4PM EST'
    },
    {
      icon: <FiMapPin />,
      title: 'Corporate Office',
      detail: '123 Sneaker Street\nNew York, NY 10001'
    }
  ];

  // Toggle FAQ question
  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  // Handle contact form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      formRef.current.reset();
      
      // Reset sent status after 5 seconds
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  // Handle chat message submission
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages([...chatMessages, newUserMessage]);
    setUserMessage('');

    // Simulate bot response after delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(userMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Simple bot response logic
  const getBotResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('track') || lowerMsg.includes('shipping')) {
      return "You can track your order by logging into your account or using the tracking link in your shipping confirmation email. Would you like me to help you find your order?";
    } else if (lowerMsg.includes('return') || lowerMsg.includes('exchange')) {
      return "Our return policy allows returns within 30 days of purchase. You can initiate a return through your account dashboard. Would you like instructions on how to start a return?";
    } else if (lowerMsg.includes('size') || lowerMsg.includes('fit')) {
      return "We have detailed size guides for each product. You can find them on the product page or in our Resources section. Would you like me to direct you to our size guide?";
    } else {
      return "Thank you for your message! A customer service representative will be with you shortly. In the meantime, is there anything else I can help you with?";
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="help-center">
      {/* Header */}
      <div className="help-header">
        <h1>Help Center</h1>
        <p>Find answers to your questions or contact our support team</p>
      </div>

      {/* Navigation Tabs */}
      <div className="help-tabs">
        <button
          className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQs
        </button>
        <button
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Us
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
      </div>

      {/* FAQ Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'faq' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search FAQs..."
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {faqCategories.map((category, catIndex) => (
              <div key={catIndex} className="faq-category">
                <h2>{category.name}</h2>
                <div className="faq-questions">
                  {category.questions.map((item, index) => {
                    const questionIndex = `${catIndex}-${index}`;
                    return (
                      <div key={index} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleQuestion(questionIndex)}
                          aria-expanded={openQuestion === questionIndex}
                        >
                          <span>{item.question}</span>
                          {openQuestion === questionIndex ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        <AnimatePresence>
                          {openQuestion === questionIndex && (
                            <motion.div
                              className="faq-answer"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p>{item.answer}</p>
                              <button 
                                className="helpful-button"
                                onClick={() => alert('Thanks for your feedback!')}
                              >
                                Was this helpful?
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="still-have-questions">
              <h3>Still have questions?</h3>
              <p>Can't find what you're looking for? Our team is ready to help.</p>
              <div className="action-buttons">
                <button 
                  className="chat-button"
                  onClick={() => setIsChatOpen(true)}
                >
                  <FiMessageSquare /> Live Chat
                </button>
                <button 
                  className="contact-button"
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Us
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'contact' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="contact-methods">
              {contactInfo.map((item, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  {item.action && (
                    <a href={item.action} className="contact-action">
                      {item.title}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="contact-form-container">
              <h2>Send us a message</h2>
              <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" required>
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="return">Returns & Exchanges</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows="5" required></textarea>
                </div>
                <button type="submit" className="submit-button" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
                {isSent && (
                  <motion.div
                    className="success-message"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiCheckCircle /> Your message has been sent successfully!
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resources Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'resources' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="resources-grid">
              {resources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <div className="resource-icon">
                    <FiHelpCircle />
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <a href={resource.link} className="resource-link">
                    View Resource
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className={`chat-widget ${isChatMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="chat-header">
              <h3>Live Chat Support</h3>
              <div className="chat-actions">
                <button 
                  className="minimize-button"
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                >
                  {isChatMinimized ? '+' : '-'}
                </button>
                <button 
                  className="close-button"
                  onClick={() => {
                    setIsChatOpen(false);
                    setIsChatMinimized(false);
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {!isChatMinimized && (
              <>
                <div className="chat-messages">
                  <div className="chat-start">
                    <p>Hi there! How can we help you today?</p>
                  </div>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                      <div className="message-content">
                        <p>{msg.text}</p>
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="chat-input">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button type="submit">Send</button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Trigger Button */}
      {!isChatOpen && (
        <motion.button
          className="chat-trigger"
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMessageSquare />
          <span>Need Help?</span>
        </motion.button>
      )}
    </div>
  );
};

export default HelpCenter;