import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "How do I reset my password?", answer: "You can reset your password by going to the settings page and clicking on 'Forgot Password'." },
  { question: "How do I contact support?", answer: "You can reach out to our support team via email at support@example.com." },
  { question: "Is there a mobile app?", answer: "Yes, our mobile app is available for both iOS and Android." },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-300 dark:border-gray-700 pb-3">
            <button
              onClick={() => toggleFAQ(index)}
              className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-800 dark:text-white py-2"
            >
              {faq.question}
              <ChevronDown className={`ml-2 transition-transform ${openIndex === index ? "rotate-180" : "rotate-0"}`} size={20} />
            </button>
            {openIndex === index && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
