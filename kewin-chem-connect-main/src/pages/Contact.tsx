// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Phone, Mail, MapPin, Factory } from "lucide-react";

// const offices = [
//   {
//     title: "Head Office",
//     icon: MapPin,
//     content: (
//       <>
//         <p className="font-medium text-blue-900">C308, The First</p>
//         <p className="text-blue-700">Vastrapur, Ahmedabad</p>
//         <p className="text-blue-700">PIN 380015</p>
//       </>
//     ),
//   },
//  {
//   title: "Contact",
//   icon: Phone,
//   content: (
//     <div className="space-y-1">
//       {/* WhatsApp / Phone */}
//       <a
//         href="https://wa.me/919879563306"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-700 font-medium hover:underline block"
//       >
//         +91 9879563306
//       </a>

//       {/* Email */}
//       <a
//         href="mailto:KEWINCHEMICALS@GMAIL.COM"
//         className="text-blue-700 font-medium hover:underline block"
//       >
//         KEWINCHEMICALS@GMAIL.COM
//       </a>
//     </div>
//   ),
  

// },

//   {
//     title: "Factory 1",
//     icon: Factory,
//     content: (
//       <>
//         <p className="text-blue-700 font-medium">
//           214, Phase - 2 G.I.D.C Vatva, Ahmedabad, Gujarat
//         </p>
//         <p className="text-blue-700">(India)</p>
//       </>
//     ),
//   },
//   {
//     title: "Factory 2",
//     icon: Factory,
//     content: (
//       <>
//         <p className="text-blue-700 font-medium">136, A.K.V.N Jhabua, Madhya Pradesh</p>
//         <p className="text-blue-700">(India)</p>
//       </>
//     ),
//   },
// ];

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });
//   const [submitted, setSubmitted] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(formData); // Replace with API call if needed
//     setSubmitted(true);
//     setFormData({ name: "", email: "", subject: "", message: "" });
//   };

//   return (
//     <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-16">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12 animate-fade-in">
//           <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
//             Contact <span className="text-blue-600">Us</span>
//           </h1>
//           <p className="text-lg text-blue-700 max-w-2xl mx-auto">
//             Reach out to Kewin Chemicals for product inquiries, support, or custom chemical solutions.
//           </p>
//         </div>

//         {/* Two-Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//           {/* Left Column - Inquiry Form */}
//           <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-slide-left">
//             <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center md:text-left">
//               Send an Inquiry
//             </h2>
//             {submitted && (
//               <p className="text-green-600 text-center mb-4">
//                 Your inquiry has been submitted successfully!
//               </p>
//             )}
//             <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Your Name"
//                 required
//                 className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
//               />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Your Email"
//                 required
//                 className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleChange}
//                 placeholder="Subject"
//                 required
//                 className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
//               />
//               <textarea
//                 name="message"
//                 value={formData.message}
//                 onChange={handleChange}
//                 placeholder="Your Message"
//                 rows={5}
//                 required
//                 className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
//               />
//               <div className="text-center md:text-right">
//                 <Button
//                   type="submit"
//                   size="lg"
//                   className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-8"
//                 >
//                   Submit Inquiry
//                 </Button>
//               </div>
//             </form>
//           </div>

//           {/* Right Column - Contact Info */}
//           <div className="space-y-6 animate-slide-right">
//             {offices.map((office, idx) => (
//               <div
//                 key={office.title}
//                 className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow"
//                 style={{ animationDelay: `${idx * 0.1}s` }}
//               >
//                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mt-1">
//                   <office.icon className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-blue-900 mb-1">{office.title}</h3>
//                   <div className="text-blue-700 text-sm leading-snug">{office.content}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Factory } from "lucide-react";

const offices = [
  {
    title: "Head Office",
    icon: MapPin,
    content: (
      <>
        <p className="font-medium text-blue-900">C308, The First</p>
        <p className="text-blue-700">Vastrapur, Ahmedabad</p>
        <p className="text-blue-700">PIN 380015</p>
      </>
    ),
  },
  {
    title: "Contact",
    icon: Phone,
    content: (
      <div className="space-y-1">
        {/* WhatsApp / Phone */}
        <a
          href="https://wa.me/919879563306"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 font-medium hover:underline block"
        >
          +91 9879563306
        </a>

        {/* Email */}
        <a
          href="mailto:KEWINCHEMICALS@GMAIL.COM"
          className="text-blue-700 font-medium hover:underline block"
        >
          KEWINCHEMICALS@GMAIL.COM
        </a>
      </div>
    ),
  },
  {
    title: "Factory 1",
    icon: Factory,
    content: (
      <a
        href="https://www.google.com/maps/place/Kewin+Chemicals+Pvt+Ltd/@22.9638752,72.6403775,16.74z/data=!4m15!1m8!3m7!1s0x395e848aa5155555:0xb8730d1b59be389f!2sKewin+Chemicals+Pvt+Ltd!8m2!3d22.9639535!4d72.6407919!10e5!16s%2Fg%2F1thhhxfq!3m5!1s0x395e848aa5155555:0xb8730d1b59be389f!8m2!3d22.9639535!4d72.6407919!16s%2Fg%2F1thhhxfq?authuser=0&entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 font-medium hover:underline block"
      >
        214, Phase - 2 G.I.D.C Vatva, Ahmedabad, Gujarat (India)
      </a>
    ),
  },
  {
    title: "Factory 2",
    icon: Factory,
    content: (
      <a
        href="https://www.google.com/maps/place/Kewin+chemicals+Pvt+Ltd+saykha+unit+1/@21.7939325,70.6977081,8z/data=!4m10!1m2!2m1!1sKewin+Chemicals+Pvt+Ltd+Madhya+Pradesh+!3m6!1s0x395f875a8713e20f:0x83515f38b0b5907a!8m2!3d21.7938945!4d72.8069544!15sCiZLZXdpbiBDaGVtaWNhbHMgUHZ0IEx0ZCBNYWRoeWEgUHJhZGVzaJIBDG1hbnVmYWN0dXJlcqoBbBABKhsiF2tld2luIGNoZW1pY2FscyBwdnQgbHRkKAAyHxABIhtNzCDzeS0vpsqjWU-xWGCmvWb7lFAe6h8ItTMyKhACIiZrZXdpbiBjaGVtaWNhbHMgcHZ0IGx0ZCBtYWRoeWEgcHJhZGVzaOABAA!16s%2Fg%2F11ry58ms9l?authuser=0&entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 font-medium hover:underline block"
      >
        136, A.K.V.N Jhabua, Madhya Pradesh (India)
      </a>
    ),
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData); // Replace with API call if needed
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
            Contact <span className="text-blue-600">Us</span>
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Reach out to Kewin Chemicals for product inquiries, support, or custom chemical solutions.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Inquiry Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-slide-left">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center md:text-left">
              Send an Inquiry
            </h2>
            {submitted && (
              <p className="text-green-600 text-center mb-4">
                Your inquiry has been submitted successfully!
              </p>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows={5}
                required
                className="p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <div className="text-center md:text-right">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-8"
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6 animate-slide-right">
            {offices.map((office, idx) => (
              <div
                key={office.title}
                className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mt-1">
                  <office.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">{office.title}</h3>
                  <div className="text-blue-700 text-sm leading-snug">{office.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
