
const FAQs = () => {
   const faqs = [
    {
      question: "How can I book tickets?",
      answer: "You can book tickets directly through our website."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, cancellation policies apply depending on show timing."
    },
    {
      question: "Do you provide food services?",
      answer: "Yes, premium food and drinks are available."
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
          FAQs
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {faq.question}
              </h2>

              <p className="text-sm sm:text-base text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default FAQs
