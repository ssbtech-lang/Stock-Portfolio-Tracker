import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const faqs = [
  { question: "How many stock-market sectors can I choose from?", answer: "There are 11 stock market sectors and various sub-sectors. The sectors include information technology (IT), energy, real estate, healthcare, financial, consumer staples, industrials, telecommunication, consumer discretionary, utilities, and materials. In India, sectors like IT, infrastructure, pharmaceuticals, and banking thrive more than others." },
  { question: "What time can you trade in the stock market?", answer: "The general operating hours of the stock market are from 9.15 am to 3.30 pm only on weekdays. But you can also trade after hours and place After Market Orders (AMO) if you fail to buy or sell during work hours." },
  { question: "Can a beginner trade in unlisted stocks?", answer: "A beginner can trade in unlisted stocks, but financial experts advise against them. As unlisted stocks are not with the market regulating authority – the Securities and Exchange Board of India (SEBI), it is not safe to invest in them." },
  { question: "Do I need a demat account for stock market trading?", answer: "A dematerialised (demat) account is necessary to trade in the stock market as trading shares is now possible and available only online in the electronic or digital form." },
  { question: "What is the P/E ratio?", answer: "The price to earnings ratio is a ratio where a company’s share price is divided by the company’s earnings per share. The P/E ratio gives insight into whether a company’s shares are over or undervalued." },
];

function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the stock data from the backend
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:3001/api/portfolio');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStocks(data); // Set the fetched stock data
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    }
    fetchData();
  }, []);

  const totalValue = stocks.reduce((acc, stock) => acc + stock.price * stock.quantity, 0);
  const totalStocks = stocks.length;
  const averagePrice = totalStocks > 0 ? totalValue / totalStocks : 0;

  const handleViewStocks = () => {
    navigate('/stocks');
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="help-page">
      <div>
        <h1 className="help-header">Portfolio Overview</h1>
        <div className="help-container">
          {/* Portfolio Metrics Section */}
          <section className="portfolio-metrics">
            <div className="metrics">
              <h3>Portfolio Metrics</h3>
              <p>Total Value: ${totalValue.toFixed(2)}</p>
              <p>Total Stocks: {totalStocks}</p>
              <p>Average Price: ${averagePrice.toFixed(2)}</p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq">
            <h1 className="help-header">Frequently Asked Questions (FAQs)</h1>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item" onClick={() => toggleFAQ(index)}>
                  <div className="faq-question">
                    <span>{faq.question}</span>
                    <span className={`faq-arrow ${openFAQ === index ? 'open' : ''}`}>↓</span>
                  </div>
                  {openFAQ === index && <div className="faq-answer">{faq.answer}</div>}
                </div>
              ))}
            </div>
          </section>

          <button onClick={handleViewStocks}>View Stocks</button>

          {/* Contact Support Section */}
          <section className="contact-support">
            <h2>Contact Support</h2>
            <p>If you have any further questions or need help, please reach out to us:</p>
            <a href="mailto:support@portfolio.com" className="support-email">
              support@portfolio.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
