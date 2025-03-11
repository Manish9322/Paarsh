import React from 'react'
const certificates = [
    { title: "Web Development", image: "/images/certificates/certificate.jpg" },
    { title: "Data Science", image: "/images/certificates/certificate.jpg" },
    { title: "UI/UX Design", image: "/images/certificates/certificate.jpg" }
  ];
export default function certificate() {
  return (
    <div className="mt-8 p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-900">
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Certificates</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {certificates.map((certificate, index) => (
        <div key={index} className="p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
          <img 
            src={certificate.image} 
            alt={`Certificate ${index + 1}`} 
            className="w-full h-auto rounded-lg"
          />
          <p className="text-gray-700 dark:text-gray-300 text-center mt-2">{certificate.title}</p>
        </div>
      ))}
    </div>
  </div>
  )
}
